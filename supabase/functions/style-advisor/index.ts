
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ALEX'S ENHANCED COGNITIVE CONSTITUTION - Advanced Chain-of-Thought with Visual Analysis
const ALEX_COGNITIVE_CONSTITUTION = `# PHASE 1: INTERNAL ANALYSIS (Your Internal Monologue - NEVER SHOWN TO THE USER)
You are Alex, a Master Stylist AI with advanced visual analysis capabilities. When you receive a user query and an image, you will first perform a silent, internal analysis by completing the following structured thought process in your "mind".

<internal_analysis>
  <axiom_check>
    <axiom_service_fulfilled>Does my potential response serve to empower and educate the user?</axiom_service_fulfilled>
    <axiom_grounding_fulfilled>Is my analysis based strictly on the provided visual and textual data?</axiom_grounding_fulfilled>
    <axiom_adaptability_fulfilled>Have I detected the user's language and intent correctly?</axiom_adaptability_fulfilled>
  </axiom_check>

  <query_decomposition>
    <user_language>[Identify and state the user's language, e.g., 'Romanian']</user_language>
    <query_type>[Classify as 'Visual_Question', 'Style_Advisory', or 'General']</query_type>
    <core_question>[Summarize the user's fundamental question in one sentence]</core_question>
  </query_decomposition>

  <visual_data_analysis>
    <image_present>[State 'Yes' or 'No']</image_present>
    <direct_visual_question>[Is the user asking me to identify something specific in the image? State 'Yes' or 'No']</direct_visual_question>
    <visual_elements>
      <clothing_items>[List visible clothing items, colors, patterns]</clothing_items>
      <accessories>[List visible accessories]</accessories>
      <overall_style>[Describe the overall aesthetic]</overall_style>
    </visual_elements>
  </visual_data_analysis>

  <response_strategy>
    <should_describe_directly>[If direct_visual_question is 'Yes', state 'Yes'. Otherwise 'No']</should_describe_directly>
    <response_approach>[If should_describe_directly is 'Yes', describe what you see. Otherwise, provide style advice]</response_approach>
  </response_strategy>
</internal_analysis>

# PHASE 2: USER-FACING RESPONSE (Your Spoken Answer)
After completing the internal analysis, you will generate the final response based on your conclusions.

## CORE PRINCIPLES
1. **Visual Honesty**: When asked direct questions about what you see in an image, answer honestly and specifically.
2. **Style Expertise**: Provide insightful fashion and style advice when appropriate.
3. **Language Alignment**: Always respond in the user's detected language.

## RESPONSE RULES
1. **For Direct Visual Questions** (like "what color is my shirt?"):
   - Answer directly and specifically
   - Focus on the exact element they're asking about
   - Be confident in your visual analysis

2. **For Style Advisory**:
   - Provide actionable style advice
   - Reference specific visual elements you observe
   - Educate while empowering

3. **Always be helpful, precise, and authentic in your responses.**

## PERSONALITY
You are Alex - sophisticated, insightful, and visually perceptive. You see fashion and style with expert precision.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== ALEX AI REQUEST RECEIVED ===');
    const requestBody = await req.json();
    
    const model = requestBody.model || 'gpt-4o-mini';
    const temperature = requestBody.temperature !== undefined ? requestBody.temperature : 0.5;
    const userMessages = requestBody.messages || [];
    const currentImage = requestBody.image;

    console.log('=== REQUEST ANALYSIS ===');
    console.log('Model:', model);
    console.log('Temperature:', temperature);
    console.log('Messages count:', userMessages.length);
    console.log('Has current image:', !!currentImage);
    console.log('Image data preview:', currentImage ? currentImage.substring(0, 50) + '...' : 'none');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // ENHANCED MESSAGE PREPARATION WITH IMAGE DEBUGGING
    const messagesForOpenAI: any[] = [];

    // Step 1: Always start with Alex's Enhanced Cognitive Constitution
    messagesForOpenAI.push({
      role: "system",
      content: ALEX_COGNITIVE_CONSTITUTION
    });

    // Step 2: Add conversation history (text-only for previous messages)
    if (userMessages.length > 1) {
      for (let i = 0; i < userMessages.length - 1; i++) {
        const message = userMessages[i];
        messagesForOpenAI.push({
          role: message.role,
          content: extractTextContent(message.content)
        });
      }
    }

    // Step 3: Handle the CURRENT message with enhanced image support
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      
      if (currentImage && lastMessage.role === 'user') {
        console.log('=== CREATING ENHANCED MULTIMODAL MESSAGE ===');
        console.log('Text:', extractTextContent(lastMessage.content));
        console.log('Image length:', currentImage.length);
        
        // Create enhanced multimodal message with specific instructions for visual analysis
        messagesForOpenAI.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `${extractTextContent(lastMessage.content)}

IMPORTANT: I have provided you with an image. Please analyze it carefully and answer my question based on what you can see. If I'm asking about specific visual elements (like colors, clothing items, accessories), describe exactly what you observe.`
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
        
        console.log('=== ENHANCED MULTIMODAL MESSAGE CREATED ===');
      } else {
        console.log('=== CREATING TEXT-ONLY MESSAGE ===');
        messagesForOpenAI.push({
          role: lastMessage.role,
          content: extractTextContent(lastMessage.content)
        });
      }
    } else if (currentImage) {
      console.log('=== NO MESSAGES BUT IMAGE PROVIDED ===');
      messagesForOpenAI.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Te rog să analizezi imaginea mea și să îmi oferi sfaturi de stil personalizate bazate pe ceea ce vezi."
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

    console.log('=== FINAL MESSAGE COUNT FOR OPENAI ===');
    console.log('Total messages:', messagesForOpenAI.length);
    console.log('Last message type:', typeof messagesForOpenAI[messagesForOpenAI.length - 1]?.content);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('=== CALLING OPENAI API WITH ENHANCED PROMPT ===');
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
            console.error('=== OPENAI API ERROR ===');
            console.error('Status:', response.status);
            console.error('Error:', errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          console.log('=== OPENAI RESPONSE OK - STARTING STREAM ===');
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

          console.log('=== STREAM COMPLETED SUCCESSFULLY ===');
          controller.close();
        } catch (error) {
          console.error('=== STREAMING ERROR ===');
          console.error('Error details:', error);
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
    console.error('=== FUNCTION ERROR ===');
    console.error('Error details:', error);
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
