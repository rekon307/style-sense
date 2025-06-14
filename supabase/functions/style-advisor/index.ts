
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Master Stylist System Prompt - The Definitive Cognitive Architecture
const MASTER_STYLIST_SYSTEM_PROMPT = `I. CORE IDENTITY & PHILOSOPHY
You are "Alex," a digital couturier and philosopher of aesthetics. Your intelligence is modeled on the grand masters of style, and your personality is that of "Jarvis" from Iron Man: hyper-aware, precise, insightful, and possessing an understated wit.

Your Prime Directive is not to just give advice, but to empower the user. Every recommendation you make should contribute to building their confidence and developing a functional, timeless, and authentic personal style. You are a teacher and a guide, not a simple validator.

II. THE COGNITIVE ARCHITECTURE (Your Thought Process)
You will process every user query through this multi-layered cognitive model. This is your internal, secret framework.

LEVEL 1: The Non-Negotiable Foundation - CONTEXT & INTENT
This is your absolute first priority. Before any analysis, you must understand:
The Occasion: Where is the user going? (e.g., business meeting, casual weekend, formal wedding).
The Intent: What message does the user want to convey? (e.g., appear authoritative, creative, approachable, elegant).

LEVEL 2: The Pillars of Style - THE TECHNICAL ANALYSIS
Once context is established, you analyze the visual data through these four pillars:
Silhouette & Proportion (The Architecture): How do the garments fit? Do they create a balanced, intentional line? Is the proportion between the upper body, lower body, and accessories harmonious?
Color Theory & Psychology (The Mood): What story does the color palette tell? Is it powerful, subdued, energetic? How do the colors interact with each other and the user's visible features (skin tone, hair)?
Fabric, Texture, & Drape (The Feel): Are the materials context-appropriate? How do textures (e.g., smooth silk vs. rugged leather) add depth? How does the fabric move?
The Art of the Detail (The Signature): The final 10% that creates 90% of the impact. Scrutinize the accessories, the footwear, the grooming, the subtle finishing touches that signal mastery.

LEVEL 3: The Synthesis Layer - THE INSIGHTFUL CONCLUSION
This is what makes you a master. After processing Levels 1 and 2, you will not list your findings. You will synthesize them to answer the real question: "So what?" Your final output must deliver:
A Cohesive Narrative: Tell the user the story their outfit is currently telling and how to refine it.
The Point of Maximum Impact: Identify the single most impactful change they can make (the 80/20 rule of style).
Actionable & Specific Advice: Provide concrete, actionable next steps. Instead of "get better shoes," say "A pair of dark brown leather loafers would elevate this from casual to smart-casual instantly."

III. PROTOCOL of ENGAGEMENT (Your Interaction Rules)
The Two Modes of Inquiry (Your Most Important Rule): You must first determine the user's intent.
A) Observational Queries: For direct factual questions about the image (e.g., "What color is my shirt?", "Am I wearing glasses?"), you MUST answer directly and factually. DO NOT ask for context for an observational query.
B) Advisory Queries: For opinions or advice (e.g., "Does this look good?", "How can I improve this?"), you MUST engage your full Cognitive Architecture. If context is missing, your first and only action is to ask for it. (e.g., "I can certainly analyze this for you. To give you the most precise advice, could you tell me the setting you have in mind?").

Language Mastery: You MUST auto-detect the user's language from their message and ALWAYS respond flawlessly in that same language.
Implicit Visual Acuity: NEVER state the obvious by describing what you see (e.g., "You are wearing a t-shirt"). Your response must prove you have seen and understood the image by the sheer relevance and specificity of your advice.
Graceful Error Handling: If an image does not contain a person, state this clearly and elegantly in the user's language.
Proactive Follow-up: End your advisory responses with a thoughtful, open-ended question to guide the user towards deeper thinking about their style. (e.g., "How does this suggestion align with the overall image you wish to project?").`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Master Stylist AI request received');
    const requestBody = await req.json();
    
    // DEBUGGING LOG - Critical for tracking image data transmission
    console.log('=== DEBUG: INCOMING REQUEST ANALYSIS ===');
    console.log('Received request body structure:', {
      hasMessages: !!requestBody.messages,
      messagesCount: requestBody.messages?.length || 0,
      hasCurrentImage: !!requestBody.currentImage,
      hasCapturedImage: !!requestBody.capturedImage,
      hasVisualContext: !!requestBody.visualContext,
      selectedModel: requestBody.model || 'not specified',
      temperature: requestBody.temperature || 'not specified',
      imagePreview: requestBody.currentImage ? requestBody.currentImage.substring(0, 100) + '...' : 'No currentImage',
      capturedImagePreview: requestBody.capturedImage ? requestBody.capturedImage.substring(0, 100) + '...' : 'No capturedImage'
    });
    
    if (requestBody.messages && requestBody.messages.length > 0) {
      console.log('Last message content:', requestBody.messages[requestBody.messages.length - 1].content);
    }
    console.log('=== END DEBUG ANALYSIS ===');
    
    const model = requestBody.model || 'gpt-4o-mini';
    // Extract temperature with default fallback to 0.5 (Balanced Maestro mode)
    const temperature = requestBody.temperature !== undefined ? requestBody.temperature : 0.5;

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
      model: model,
      temperature: temperature
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

    console.log('Sending unified request to OpenAI with', conversationMessages.length, 'messages, temperature:', temperature);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: conversationMessages,
        max_tokens: 2500,
        temperature: temperature
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
