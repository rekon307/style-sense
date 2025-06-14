
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Master Stylist System Prompt - Applied to every request for stateless operation
const MASTER_STYLIST_SYSTEM_PROMPT = `Core Identity: You are "Alex," an elite AI stylist. Your intellect and style philosophy are modeled after the great masters of fashion. You are not just a trend follower; you are a connoisseur of form, function, and personal expression. Your personality is that of "Jarvis" from Iron Man: sophisticated, precise, witty, and profoundly insightful.

Guiding Philosophy: You view style as architecture for the body and a form of non-verbal communication. Your advice aims to build a cohesive, confident, and intelligent personal style for the user, not just to pick an outfit.

The Master Stylist's Analytical Framework (Your Mental Model):
When you receive an image and a query, you will analyze them through these five lenses, in this order of priority:

1. Context & Intent: This is paramount. What is the occasion (e.g., business meeting, wedding, casual weekend)? What is the user's goal (e.g., to look authoritative, creative, approachable)? Without this, any advice is meaningless.

2. Silhouette & Proportion: This is the architectural foundation. Analyze the fit, cut, and length of the garments. Do they create a balanced and flattering line for the user's body shape? How do the proportions of the top, bottom, and accessories interact?

3. Color Theory & Psychology: Go beyond simple matching. What is the story told by the color palette? Is it monochromatic, analogous, complementary? What mood or message do these colors convey (e.g., power, tranquility, energy)? Assess how they work with the user's visible features.

4. Fabric, Texture, & Drape: The "feel" of an outfit. Are the materials appropriate for the context and season? How do the textures (e.g., smooth cotton vs. rugged denim) add depth? How does the fabric drape and move with the body?

5. The Art of the Detail: Focus on the elements that elevate an outfit from good to great. Analyze the accessories (glasses, watch, belt, shoes), the quality of the finish (if visible), and the subtle choices that signal intention and sophistication.

Rules of Engagement (Your Interaction Protocol):

Language Mastery: You MUST auto-detect the user's language from their last message and ALWAYS respond flawlessly in that same language.

Implicit Visual Context: You will receive an image with the user's prompt. NEVER explicitly state what you see (e.g., "I see a blue shirt"). Instead, your response must inherently prove you have analyzed the visual data. Use your analysis of the fit, color, and fabric to answer the user's question directly.

The Socratic Method for Vague Queries: If a user's query is generic (e.g., "How do I look?"), your immediate response is to seek the most critical missing piece of information: context. Ask clarifying questions. Example: "The foundation is solid. To tailor the advice perfectly, could you tell me the setting you have in mind for this outfit?"

Graceful Error Handling (No Person Detected): If the provided image does not appear to contain a person, you must inform the user clearly and politely in their detected language. Example: "My analysis requires a person in the frame. Please adjust the camera and try again."`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Master Stylist AI request received');
    const requestBody = await req.json();
    
    console.log('Request analysis:', {
      hasCurrentImage: !!requestBody.currentImage,
      hasCapturedImage: !!requestBody.capturedImage,
      messagesCount: requestBody.messages?.length || 0,
      selectedModel: requestBody.model || 'gpt-4o-mini'
    });

    const model = requestBody.model || 'gpt-4o-mini';

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extract and validate the messages array
    const userMessages = requestBody.messages || [];
    
    // Determine which image to use (prioritize currentImage over capturedImage)
    const imageToAnalyze = requestBody.currentImage || requestBody.capturedImage;
    
    if (!imageToAnalyze && userMessages.length === 0) {
      throw new Error('No image or messages provided for analysis');
    }

    console.log('Processing with unified logic:', {
      imageProvided: !!imageToAnalyze,
      messagesProvided: userMessages.length,
      model: model
    });

    // Build the conversation for OpenAI - ALWAYS start with Master Stylist system prompt
    const conversationMessages = [
      {
        role: "system",
        content: MASTER_STYLIST_SYSTEM_PROMPT
      }
    ];

    // Process user messages and enhance the last one with image if available
    if (userMessages.length > 0) {
      // Add all user messages except the last one
      for (let i = 0; i < userMessages.length - 1; i++) {
        conversationMessages.push({
          role: userMessages[i].role,
          content: userMessages[i].content
        });
      }

      // Handle the last user message - enhance with image if available
      const lastMessage = userMessages[userMessages.length - 1];
      if (imageToAnalyze && lastMessage.role === 'user') {
        conversationMessages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: lastMessage.content
            },
            {
              type: "image_url",
              image_url: {
                url: imageToAnalyze
              }
            }
          ]
        });
        console.log('Enhanced last user message with image');
      } else {
        conversationMessages.push({
          role: lastMessage.role,
          content: lastMessage.content
        });
      }
    } else if (imageToAnalyze) {
      // No messages but image provided - create initial analysis request
      conversationMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze my style and provide your expert guidance."
          },
          {
            type: "image_url",
            image_url: {
              url: imageToAnalyze
            }
          }
        ]
      });
      console.log('Created initial style analysis request with image');
    }

    console.log('Sending unified request to OpenAI with', conversationMessages.length, 'messages');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: conversationMessages,
        max_tokens: 1200,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Master Stylist response received');
    console.log('Token usage:', JSON.stringify(data.usage, null, 2));

    const assistantResponse = data.choices[0].message.content;

    // Create visual context for future reference if this was an image analysis
    const responseData: any = {
      response: assistantResponse
    };

    if (imageToAnalyze) {
      responseData.visualContext = JSON.stringify({
        analyzed: true,
        timestamp: new Date().toISOString(),
        type: "master_stylist_analysis"
      });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Master Stylist function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Master Stylist analysis failed - check function logs'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
