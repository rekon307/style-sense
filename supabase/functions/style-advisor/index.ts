
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Received style analysis request');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify({
      hasCapturedImage: !!body.capturedImage,
      messagesCount: body.messages?.length || 0,
      hasVisualContext: !!body.visualContext,
      selectedModel: body.model
    }));

    // Check if this is an initial image analysis or a conversation
    if (body.capturedImage && !body.messages) {
      console.log('Processing initial image analysis...');
      return await handleImageAnalysis(body.capturedImage, body.model || 'gpt-4o-mini');
    } else if (body.messages && body.messages.length > 0) {
      console.log('Processing conversation message...');
      return await handleConversation(body.messages, body.visualContext, body.model || 'gpt-4o-mini');
    } else {
      console.error('Invalid request format - missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in style-advisor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleImageAnalysis(imageDataURL: string, model: string) {
  const messages = [
    {
      role: "system",
      content: "You are a professional fashion stylist and image consultant. Analyze the photo and provide personalized style advice. You MUST respond with a valid JSON object containing exactly two keys: 'reply' (a friendly, user-facing analysis) and 'visualContext' (a concise, factual description of the user's appearance including clothing, colors, accessories like glasses, etc.)."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Please analyze this photo and provide personalized style advice. Consider skin tone, face shape, current style, and suggest specific improvements for clothing, colors, and accessories. Remember to respond in valid JSON format with 'reply' and 'visualContext' keys."
        },
        {
          type: "image_url",
          image_url: {
            url: imageDataURL
          }
        }
      ]
    }
  ];

  console.log('Using model:', model);
  console.log('API Messages:', JSON.stringify(messages, null, 2));
  
  console.log('Sending request to OpenAI API...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 1000,
      temperature: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  console.log('Received response from OpenAI API');
  const data = await response.json();
  console.log('OpenAI response:', JSON.stringify(data, null, 2));

  // Extract token usage information
  const tokenUsage = data.usage || {};
  console.log('Token usage:', tokenUsage);

  const rawResponse = data.choices[0].message.content;
  console.log('Raw response:', rawResponse);

  // Clean the response to extract JSON from markdown code blocks
  const cleanedResponse = extractJSONFromMarkdown(rawResponse);
  
  try {
    const parsedResponse = JSON.parse(cleanedResponse);
    
    return new Response(JSON.stringify({
      reply: parsedResponse.reply,
      visualContext: parsedResponse.visualContext,
      tokenUsage: tokenUsage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (parseError) {
    console.error('Failed to parse JSON response:', parseError);
    console.error('Cleaned response was:', cleanedResponse);
    
    // Fallback: try to extract meaningful content
    return new Response(JSON.stringify({
      reply: rawResponse || "I can see your style in the photo. Let me provide some personalized advice based on what I observe.",
      visualContext: "Unable to parse detailed visual context",
      tokenUsage: tokenUsage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleConversation(messages: any[], visualContext: string | null, model: string) {
  const systemMessage = {
    role: "system",
    content: `You are a professional fashion stylist and image consultant. ${visualContext ? `Based on the initial image analysis: ${visualContext}. ` : ''}Provide helpful, personalized fashion advice. Keep responses conversational and practical.`
  };

  const apiMessages = [systemMessage, ...messages];

  console.log('Sending conversation to OpenAI...');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: apiMessages,
      max_tokens: 800,
      temperature: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Extract token usage information
  const tokenUsage = data.usage || {};
  console.log('Token usage:', tokenUsage);

  return new Response(JSON.stringify({
    response: aiResponse,
    tokenUsage: tokenUsage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractJSONFromMarkdown(text: string): string {
  // Remove markdown code block markers
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // If no code blocks found, return the original text
  return text.trim();
}
