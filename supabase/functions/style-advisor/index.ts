
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const body = await req.json();
    const { capturedImage, messages } = body;
    
    console.log('Received style analysis request');
    
    let apiMessages = [];
    
    // System prompt for style advice
    const systemPrompt = {
      role: "system",
      content: "You are a professional fashion stylist and image consultant. Provide personalized style advice based on what you observe in photos or respond to follow-up questions about fashion and styling. Be specific, practical, and encouraging in your recommendations."
    };
    
    apiMessages.push(systemPrompt);
    
    // Handle initial request with captured image
    if (capturedImage) {
      console.log('Processing initial image analysis...');
      
      const userMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this photo and provide personalized style advice. Consider skin tone, face shape, current style, and suggest specific improvements for clothing, colors, and accessories."
          },
          {
            type: "image_url",
            image_url: {
              url: capturedImage
            }
          }
        ]
      };
      
      apiMessages.push(userMessage);
    }
    
    // Handle follow-up conversation with messages array
    else if (messages && Array.isArray(messages)) {
      console.log('Processing follow-up conversation...', messages);
      
      // Add all previous messages to maintain conversation context
      apiMessages.push(...messages);
    }
    
    // If neither capturedImage nor messages is provided
    else {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Make API call to Deepseek with the correct model name
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Updated to use the correct model name
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepseek API error:', response.status, errorText);
      throw new Error(`Deepseek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from Deepseek API');
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response content from Deepseek API');
    }

    // Format response based on request type
    if (capturedImage) {
      // Initial analysis response
      return new Response(JSON.stringify({ analysis: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Follow-up conversation response
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in style-advisor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
