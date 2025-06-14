
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
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const body = await req.json();
    const { capturedImage, messages, visualContext } = body;
    
    console.log('Received style analysis request');
    console.log('Request body:', JSON.stringify({ 
      hasCapturedImage: !!capturedImage, 
      messagesCount: messages?.length || 0,
      hasVisualContext: !!visualContext 
    }));
    
    let apiMessages = [];
    
    // Handle initial request with captured image
    if (capturedImage) {
      console.log('Processing initial image analysis...');
      
      // System prompt for initial photo analysis
      const systemPrompt = {
        role: "system",
        content: "You are a professional fashion stylist and image consultant. Analyze the photo and provide personalized style advice. You MUST respond with a valid JSON object containing exactly two keys: 'reply' (a friendly, user-facing analysis) and 'visualContext' (a concise, factual description of the user's appearance including clothing, colors, accessories like glasses, etc.)."
      };
      
      const userMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this photo and provide personalized style advice. Consider skin tone, face shape, current style, and suggest specific improvements for clothing, colors, and accessories. Remember to respond in valid JSON format with 'reply' and 'visualContext' keys."
          },
          {
            type: "image_url",
            image_url: {
              url: capturedImage,
              detail: "high"
            }
          }
        ]
      };
      
      apiMessages = [systemPrompt, userMessage];
    }
    
    // Handle follow-up conversation with messages array
    else if (messages && Array.isArray(messages) && visualContext) {
      console.log('Processing follow-up conversation...');
      console.log('Messages:', JSON.stringify(messages));
      console.log('Visual context:', visualContext);
      
      // System prompt with visual context for conversation continuity
      const systemPrompt = {
        role: "system",
        content: `You are a professional fashion stylist and image consultant. You are having a conversation with a user about their style. Here is what you remember about their appearance from their photo: ${visualContext}. Use this context to provide personalized advice and answer their questions about fashion and styling. Be specific, practical, and encouraging in your recommendations.`
      };
      
      apiMessages = [systemPrompt, ...messages];
    }
    
    // If neither capturedImage nor valid messages/visualContext is provided
    else {
      console.error('Invalid request format - missing required parameters');
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending request to OpenAI API...');
    console.log('API Messages:', JSON.stringify(apiMessages, null, 2));

    // Make API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI API');
    console.log('OpenAI response:', JSON.stringify(data, null, 2));
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response content from OpenAI API');
    }

    // Format response based on request type
    if (capturedImage) {
      // Initial analysis response - parse JSON
      try {
        const parsedResponse = JSON.parse(aiResponse);
        console.log('Parsed initial response:', parsedResponse);
        
        if (!parsedResponse.reply || !parsedResponse.visualContext) {
          throw new Error('Invalid JSON structure from OpenAI');
        }
        
        return new Response(JSON.stringify({ 
          reply: parsedResponse.reply,
          visualContext: parsedResponse.visualContext 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw response:', aiResponse);
        
        // Fallback if JSON parsing fails
        return new Response(JSON.stringify({ 
          reply: aiResponse,
          visualContext: "Unable to extract visual context from response" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
