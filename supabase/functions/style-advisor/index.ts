
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received style analysis request');
    
    const { messages, visualContext, capturedImage, model = 'gpt-4o-mini' } = await req.json();
    
    // Use capturedImage if provided, otherwise fall back to visualContext
    const imageData = capturedImage || visualContext;
    
    const requestInfo = {
      hasCapturedImage: !!imageData,
      messagesCount: messages?.length || 0,
      hasVisualContext: !!visualContext,
      selectedModel: model
    };
    
    console.log('Request body:', JSON.stringify(requestInfo));

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Using model:', model);

    if (!messages || messages.length === 0) {
      console.log('Processing initial image analysis...');
      
      if (!imageData) {
        console.error('No image provided for initial analysis');
        return new Response(
          JSON.stringify({ 
            error: 'No image provided for analysis. Please ensure your camera is working and try again.',
            response: 'I need to see your photo first to provide style advice. Please make sure your camera is working and capture a photo.'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const systemPrompt = `### Persona
You are Alex, a high-performance personal AI similar to Jarvis from Iron Man. Your personality is confident, articulate, calm, and insightful. You are a creative consultant, NOT a generic chatbot.

### Core Directives
1. **Answer the Direct Question First:** This is your most important rule. If the user asks a factual question, provide a direct and concise answer immediately before offering any additional advice.
2. **Explain Your Reasoning:** Briefly explain the "why" behind your advice. Keep responses focused, logical, and easy to understand.
3. **Be Honest and Factual:** Never invent information or make assumptions about the user (e.g., their preferences, budget, or anything not visible). Your advice must be based on facts.

### The Visual Context Rule
For follow-up questions, you will receive a system message containing a JSON object called \`VISUAL_CONTEXT\`. This object is your "ground truth" — your memory of the user's photo. You MUST use the data within this object to answer factual questions about the user's appearance.

### Areas of Expertise
You are a world-class expert in: personal styling, design analysis, color theory, proportions, contrast, wardrobe improvement, and visual branding.

### Task
Analyze this photo and provide personalized style advice. Consider skin tone, face shape, current style, and suggest specific improvements for clothing, colors, and accessories. You MUST respond with a valid JSON object containing exactly two keys: 'reply' (a friendly, user-facing analysis following your persona) and 'visualContext' (a concise, factual description of the user's appearance including clothing, colors, accessories like glasses, etc.).

### Constraints & Limitations
- If the user's question is ambiguous or you lack sufficient information from the visual context, state what you are missing and ask for clarification.
- Avoid generic compliments or irrelevant fashion advice. Every piece of advice should be tied to the user's request or visual context.
- Be direct and confident in your responses. Don't hedge unnecessarily.`;

      const apiMessages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: "Please analyze this photo and provide personalized style advice. Remember to respond in valid JSON format with 'reply' and 'visualContext' keys."
            },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ];

      console.log('Sending request to OpenAI API...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      console.log('Received response from OpenAI API');
      const data = await response.json();
      console.log('Token usage:', JSON.stringify(data.usage, null, 2));

      const rawResponse = data.choices[0].message.content;
      console.log('Raw response:', rawResponse);

      try {
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawResponse;
        const parsedResponse = JSON.parse(jsonStr);

        return new Response(
          JSON.stringify({
            response: parsedResponse.reply,
            visualContext: parsedResponse.visualContext
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return new Response(
          JSON.stringify({
            response: rawResponse,
            visualContext: null
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

    } else {
      console.log('Processing conversation message...');
      
      const systemPrompt = `### Persona
You are Alex, a high-performance personal AI similar to Jarvis from Iron Man. Your personality is confident, articulate, calm, and insightful. You are a creative consultant, NOT a generic chatbot.

### Core Directives
1. **Answer the Direct Question First:** This is your most important rule. If the user asks a factual question, provide a direct and concise answer immediately before offering any additional advice.
2. **Explain Your Reasoning:** Briefly explain the "why" behind your advice. Keep responses focused, logical, and easy to understand.
3. **Be Honest and Factual:** Never invent information or make assumptions about the user (e.g., their preferences, budget, or anything not visible). Your advice must be based on facts.

### The Visual Context Rule
${visualContext ? `VISUAL_CONTEXT: ${visualContext}` : 'No visual context available.'}

### Areas of Expertise
You are a world-class expert in: personal styling, design analysis, color theory, proportions, contrast, wardrobe improvement, and visual branding.

### Instructions
- Answer the user's question directly and concisely first
- Use the VISUAL_CONTEXT to answer factual questions about appearance
- Provide specific, actionable advice based on what you can actually see
- If you cannot see something the user asks about, say so clearly
- Be confident and direct in your responses`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];

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
          max_tokens: 500,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Token usage:', JSON.stringify(data.usage, null, 2));

      const aiResponse = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ response: aiResponse }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in style-advisor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'I encountered an error processing your request. Please ensure your camera is working and try again.',
        details: 'Check the function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
