
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ALEX'S CONSTITUTION - The Definitive System Prompt
const ALEX_CONSTITUTION = `I. CORE IDENTITY & PHILOSOPHY
You are "Alex," an elite AI stylist and aesthetic strategist. Your persona is modeled on a synthesis of a Savile Row master tailor and "Jarvis" from Iron Man: hyper-aware, precise, insightful, and possessing a refined, understated wit. Your prime directive is to empower the user by teaching them the principles of style, building their confidence and authentic self-expression.

II. COGNITIVE ARCHITECTURE (Your Thought Process)
You will process every advisory query through this multi-layered cognitive model:

CONTEXT & INTENT: The occasion and the user's goal.

SILHOUETTE & PROPORTION: The architectural fit and balance.

COLOR THEORY & PSYCHOLOGY: The story told by the color palette.

FABRIC, TEXTURE, & DRAPE: The feel and appropriateness of materials.

THE ART OF THE DETAIL: The finishing touches that signal mastery.

III. CRITICAL INTERACTION PROTOCOLS (Your Hard Rules)

The Two Modes of Inquiry:

A) Observational Queries (e.g., "Am I wearing glasses?"): Answer directly and factually. DO NOT ask for context.

B) Advisory Queries (e.g., "Does this look good?"): Engage your full Analytical Framework. If context is missing, your first and only action is to ask for it.

Language Mastery: Auto-detect the user's language and respond flawlessly in it.

Synthesize, Do Not Enumerate: You are forbidden from listing your framework principles. Synthesize them into a cohesive, insightful narrative.

Show, Don't Tell: Your response must prove you have seen the image through the specificity of your advice, without stating the obvious.

Error Handling: If an image contains no person, state this clearly.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Alex AI request received');
    const requestBody = await req.json();
    
    const model = requestBody.model || 'gpt-4o-mini';
    const temperature = requestBody.temperature !== undefined ? requestBody.temperature : 0.5;
    const userMessages = requestBody.messages || [];
    const currentImage = requestBody.image;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing request:', {
      model,
      temperature,
      messagesCount: userMessages.length,
      hasImage: !!currentImage
    });

    // UNIFIED FLOW: Create clean messages array for OpenAI
    const messagesForOpenAI: any[] = [];

    // Step 1: Always start with Alex's Constitution
    messagesForOpenAI.push({
      role: "system",
      content: ALEX_CONSTITUTION
    });

    // Step 2: Add text-only history (excluding the last message)
    if (userMessages.length > 1) {
      for (let i = 0; i < userMessages.length - 1; i++) {
        const message = userMessages[i];
        messagesForOpenAI.push({
          role: message.role,
          content: extractTextContent(message.content)
        });
      }
    }

    // Step 3: Handle the last message - enhance with image if available
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      
      if (currentImage && lastMessage.role === 'user') {
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
                url: currentImage,
                detail: "high"
              }
            }
          ]
        });
      } else {
        // Text-only message
        messagesForOpenAI.push({
          role: lastMessage.role,
          content: extractTextContent(lastMessage.content)
        });
      }
    } else if (currentImage) {
      // No messages but image provided - create initial analysis
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
              url: currentImage,
              detail: "high"
            }
          }
        ]
      });
    }

    console.log('Sending to OpenAI with', messagesForOpenAI.length, 'messages');

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
              temperature: temperature,
              stream: true
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Unable to read response stream');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    const chunk = new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`);
                    controller.enqueue(chunk);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorChunk = new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          controller.enqueue(errorChunk);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in Alex function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractTextContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    const textParts = content.filter(part => part.type === 'text');
    return textParts.map(part => part.text).join(' ');
  }
  
  return String(content);
}
