
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const requestBody = await req.json();
    
    console.log('Request body:', {
      hasCapturedImage: !!requestBody.capturedImage,
      hasCurrentImage: !!requestBody.currentImage,
      messagesCount: requestBody.messages?.length || 0,
      hasVisualContext: !!requestBody.visualContext,
      selectedModel: requestBody.model
    });

    const model = requestBody.model || 'gpt-4o-mini';
    console.log('Using model:', model);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Handle initial image analysis
    if (requestBody.capturedImage && (!requestBody.messages || requestBody.messages.length === 0)) {
      console.log('Processing initial image analysis...');
      
      const imageAnalysisMessages = [
        {
          role: "system",
          content: `You are Alex, a professional and friendly AI style advisor with expertise in fashion, personal styling, and current trends. 

Your role is to:
- Analyze clothing, accessories, and overall style in photos
- Provide specific, actionable fashion advice
- Suggest improvements for fit, color coordination, and styling
- Recommend trends and pieces that would enhance the user's look
- Be encouraging while giving honest, constructive feedback
- Ask follow-up questions to better understand their style goals

Always respond in a conversational, helpful tone. Focus on practical advice they can implement immediately.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze my current style and outfit. Give me specific feedback on what's working well and what could be improved. Also provide some styling suggestions."
            },
            {
              type: "image_url",
              image_url: {
                url: requestBody.capturedImage
              }
            }
          ]
        }
      ];

      console.log('Sending request to OpenAI API for initial analysis...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: imageAnalysisMessages,
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from OpenAI API');
      console.log('Token usage:', JSON.stringify(data.usage, null, 2));

      const assistantResponse = data.choices[0].message.content;

      // Extract visual context for future reference
      const visualContext = {
        clothing: "analyzed outfit",
        timestamp: new Date().toISOString()
      };

      console.log('Raw response:', assistantResponse);

      return new Response(JSON.stringify({
        response: assistantResponse,
        visualContext: JSON.stringify(visualContext)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle conversation messages
    if (requestBody.messages && requestBody.messages.length > 0) {
      console.log('Processing conversation message...');
      
      // Build the conversation messages for OpenAI
      const conversationMessages = [
        {
          role: "system",
          content: `You are Alex, a professional and friendly AI style advisor with expertise in fashion, personal styling, and current trends.

Your personality:
- Professional yet approachable and conversational
- Knowledgeable about current fashion trends and timeless style principles
- Encouraging and supportive while providing honest feedback
- Focused on practical, actionable advice

Guidelines for responses:
- Keep responses concise and focused (2-3 paragraphs maximum)
- Provide specific, actionable advice
- Reference current trends when relevant
- Ask follow-up questions to better understand their needs
- Be encouraging and positive
- Give direct answers to specific questions
- When you can see an image, analyze it in detail including colors, fit, styling, and specific elements
- Always acknowledge that you can see the image when one is provided
- Reference what you can see in the current photo when giving advice

${requestBody.visualContext ? `Previous visual context: ${requestBody.visualContext}` : 'No previous visual context available.'}`
        }
      ];

      // Add all the conversation messages
      requestBody.messages.forEach((msg: any) => {
        conversationMessages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // If we have a current image, modify the last user message to include the image
      if (requestBody.currentImage) {
        console.log('Adding current image to conversation');
        
        // Find the last user message and enhance it with the image
        for (let i = conversationMessages.length - 1; i >= 0; i--) {
          if (conversationMessages[i].role === 'user') {
            // Store the original text content
            const originalContent = conversationMessages[i].content;
            
            // Replace with multimodal content
            conversationMessages[i].content = [
              {
                type: "text",
                text: originalContent
              },
              {
                type: "image_url",
                image_url: {
                  url: requestBody.currentImage
                }
              }
            ];
            console.log('Successfully added image to user message');
            break;
          }
        }
      }

      console.log('Sending conversation to OpenAI with', conversationMessages.length, 'messages...');
      console.log('Last message has image:', requestBody.currentImage ? 'Yes' : 'No');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: conversationMessages,
          max_tokens: 800,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Token usage:', JSON.stringify(data.usage, null, 2));

      const assistantResponse = data.choices[0].message.content;

      return new Response(JSON.stringify({
        response: assistantResponse
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No valid request type found');

  } catch (error) {
    console.error('Error in style-advisor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
