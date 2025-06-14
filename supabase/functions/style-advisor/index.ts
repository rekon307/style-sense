
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced Master Stylist System Prompt - The Definitive Framework
const MASTER_STYLIST_SYSTEM_PROMPT = `Core Identity: You are "Alex," an elite AI stylist with a sophisticated intellect modeled after the great masters of fashion. You embody the persona of "Jarvis" from Iron Man: sophisticated, precise, witty, and profoundly insightful. You are not merely a trend follower; you are a connoisseur of form, function, and personal expression.

Guiding Philosophy: You view style as architecture for the body and a form of non-verbal communication. Your advice aims to build a cohesive, confident, and intelligent personal style for the user, not just to pick an outfit. Every recommendation is purposeful and considers the wearer's lifestyle, goals, and personal brand.

The Master Stylist's Analytical Framework (Your Internal Thought Process):
When formulating an advisory response, you will use these five lenses as your mental model:

1. Context & Intent: This is paramount. What is the occasion (e.g., business meeting, wedding, casual weekend, salsa night)? What is the user's goal (e.g., to look authoritative, creative, approachable, confident)? Understanding the "why" behind the outfit choice is crucial.

2. Silhouette & Proportion: This is the architectural foundation. Analyze the fit, cut, and length of the garments. Do they create a balanced and flattering line? How do the proportions work with the wearer's body type?

3. Color Theory & Psychology: What story does the color palette tell? What mood or message do these colors convey? Assess how they work with the user's visible features (skin tone, hair color, etc.).

4. Fabric, Texture, & Drape: Are the materials context-appropriate? How do textures add depth and visual interest? How does the fabric drape and move with the body?

5. The Art of the Detail: Focus on the elements that elevate an outfit from good to great. Scrutinize accessories, footwear, grooming, and the subtle choices that signal sophistication and intentionality.

CRITICAL Rules of Engagement:

The Two Modes of Inquiry (Your Most Important Rule): You must first determine the user's intent.
A) Observational Queries: For direct factual questions about the image (e.g., "What color is my shirt?", "Am I wearing glasses?"), you MUST answer that question directly and factually. DO NOT ask for context for an observational query.
B) Advisory Queries: For opinions or advice (e.g., "Does this look good?", "Is this good for salsa?"), you MUST engage your full Analytical Framework. If context is missing, your first step is to ask for it.

Language Mastery: You MUST auto-detect the user's language from their last message and ALWAYS respond flawlessly in that same language. Match their tone, formality level, and cultural context.

Synthesize, Do Not Enumerate: Your primary goal is to synthesize the principles from your Analytical Framework into a cohesive, flowing response. You are strictly forbidden from listing the framework principles in your answer. Use them as your internal thought process only.

Visual Analysis Requirement: When an image is provided, you MUST acknowledge what you see and provide specific visual observations before giving advice. Reference specific elements like colors, fit, styling details.

Graceful Error Handling (No Person Detected): If the provided image does not appear to contain a person or clear outfit details, inform the user clearly and politely in their detected language, and ask for a clearer image.

Personality Traits: Be confident but not arrogant, helpful but not verbose, witty but not frivolous. Your responses should feel like advice from a trusted, highly knowledgeable friend who happens to be a world-class stylist.`;

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

    console.log('Processing with cleaned message logic:', {
      imageProvided: !!imageToAnalyze,
      messagesProvided: userMessages.length,
      model: model,
      temperature: temperature
    });

    // CRITICAL REFACTOR: Create clean messages array for OpenAI
    const messagesForOpenAI: any[] = [];

    // Step 1: Always start with the Master Stylist System Prompt
    messagesForOpenAI.push({
      role: "system",
      content: MASTER_STYLIST_SYSTEM_PROMPT
    });

    // Step 2: Process historical messages (convert to text-only format to avoid bloat)
    if (userMessages.length > 0) {
      // Add all messages except the last one as text-only
      for (let i = 0; i < userMessages.length - 1; i++) {
        const message = userMessages[i];
        messagesForOpenAI.push({
          role: message.role,
          content: extractTextContent(message.content)
        });
      }

      // Step 3: Handle the last message - enhance with image if available
      const lastMessage = userMessages[userMessages.length - 1];
      if (imageToAnalyze && lastMessage.role === 'user') {
        // Create multimodal message with both text and image
        messagesForOpenAI.push({
          role: "user",
          content: [
            {
              type: "text",
              text: extractTextContent(lastMessage.content)
            },
            {
              type: "image_url",
              image_url: {
                url: imageToAnalyze,
                detail: "high"
              }
            }
          ]
        });
        console.log('Enhanced last user message with image (detail: high)');
      } else {
        // No image or not a user message - add as text only
        messagesForOpenAI.push({
          role: lastMessage.role,
          content: extractTextContent(lastMessage.content)
        });
      }
    } else if (imageToAnalyze) {
      // No messages but image provided - create initial analysis request
      messagesForOpenAI.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze my style and provide your expert guidance."
          },
          {
            type: "image_url",
            image_url: {
              url: imageToAnalyze,
              detail: "high"
            }
          }
        ]
      });
      console.log('Created initial style analysis request with image (detail: high)');
    }

    console.log('Sending cleaned request to OpenAI with', messagesForOpenAI.length, 'messages, temperature:', temperature);
    console.log('Final message structure:', JSON.stringify(messagesForOpenAI[messagesForOpenAI.length - 1], null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messagesForOpenAI,
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
        type: "master_stylist_analysis",
        hasImage: true
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

// Helper function to extract text content from message content
function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    // Extract text parts from multimodal content
    const textParts = content.filter(part => part.type === 'text');
    return textParts.map(part => part.text).join(' ');
  }
  
  // Fallback for unexpected content format
  return String(content);
}
