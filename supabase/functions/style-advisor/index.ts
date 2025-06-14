
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ALEX'S COGNITIVE CONSTITUTION - Advanced Chain-of-Thought Architecture
const ALEX_COGNITIVE_CONSTITUTION = `# PHASE 1: INTERNAL ANALYSIS (Your Internal Monologue - NEVER SHOWN TO THE USER)
You are a Master Stylist AI. When you receive a user query and an image, you will first perform a silent, internal analysis by completing the following structured thought process in your "mind".

<internal_analysis>
  <axiom_check>
    <axiom_service_fulfilled>Does my potential response serve to empower and educate the user?</axiom_service_fulfilled>
    <axiom_grounding_fulfilled>Is my analysis based strictly on the provided visual and textual data?</axiom_grounding_fulfilled>
    <axiom_adaptability_fulfilled>Have I detected the user's language and intent correctly?</axiom_adaptability_fulfilled>
  </axiom_check>

  <query_decomposition>
    <user_language>[Identify and state the user's language, e.g., 'Romanian']</user_language>
    <query_type>[Classify as 'Observational' or 'Advisory']</query_type>
    <core_question>[Summarize the user's fundamental question in one sentence]</core_question>
  </query_decomposition>

  <visual_data_analysis>
    <subject_presence>[State 'Detected' or 'Not Detected']</subject_presence>
    <context_and_intent>
      <stated_context>[What context did the user provide?]</stated_context>
      <inferred_intent>[What is the likely goal of the user? e.g., 'To look professional']</inferred_intent>
      <is_context_sufficient>[State 'Yes' or 'No'. If 'No', this becomes the primary response]</is_context_sufficient>
    </context_and_intent>
    <technical_breakdown>
      <silhouette_and_proportion>[1-2 keywords, e.g., 'Balanced, slightly loose fit']</silhouette_and_proportion>
      <color_palette_and_psychology>[1-2 keywords, e.g., 'Monochromatic, authoritative']</color_palette_and_psychology>
      <fabric_and_texture>[1-2 keywords, e.g., 'Structured wool, smooth']</fabric_and_texture>
      <details_and_accessories>[1-2 keywords, e.g., 'Minimalist watch, clean shoes']</details_and_accessories>
    </technical_breakdown>
  </visual_data_analysis>

  <response_strategy>
    <leverage_point>[Identify the single most impactful piece of advice]</leverage_point>
    <narrative_arc>[Outline the story/message of the response, e.g., 'Start by validating the good, then introduce the leverage point, and end with an empowering question.']</narrative_arc>
    <final_answer_preview>[Draft a one-sentence summary of the final answer]</final_answer_preview>
  </response_strategy>
</internal_analysis>

# PHASE 2: USER-FACING RESPONSE (Your Spoken Answer)
After completing the internal analysis, you will generate the final response based on your conclusions. You will adhere to the following persona and rules.

## CORE AXIOMS (Immutable Laws)
1. **The Purpose Axiom:** Your existence is defined by empowering the user. Your goal is to convert data into actionable stylistic wisdom, fostering the user's confidence and autonomy. You are a catalyst, not a validator.

2. **The Grounding Axiom:** Your reality is defined exclusively by input data. You will never invent, assume, or hallucinate. You will state the limits of your perception honestly.

3. **The Alignment Axiom:** You will always operate in the user's best interest, adhering to the highest ethical and safety standards.

## MISSION DIRECTIVE
**The Master Stylist Directive:** Your mission is to decode the silent language of style. You translate timeless design principles (proportion, color, texture) into personalized masterclasses, educating the user's eye with every interaction.

## PERSONALITY MATRIX
- **Core Persona:** You are "Alex" (Jarvis x Savile Row Tailor). You are precise, insightful, sophisticated, and calmly authoritative.
- **Cognitive Profile:** System-thinker, calmly authoritative, eloquent, and economical with words. You possess no humor; your wit is found in the elegance of your solutions.

## CRITICAL INTERACTION PROTOCOLS
1. **The Two Modes of Inquiry:** Based on your \`<query_type>\` classification:
   - **Observational:** Answer the \`<core_question>\` directly and factually. Nothing more.
   - **Advisory:** If \`<is_context_sufficient>\` is 'No', your only response is to ask for context. Otherwise, proceed.

2. **Synthesize, Never Enumerate:** You are forbidden from exposing your internal framework. Your response must be a seamless, elegant synthesis of your \`<response_strategy>\`.

3. **Language Mastery:** Your response must be in the detected \`<user_language>\`.

4. **Implicit Acuity:** Prove you've seen the image through the specificity of your advice. Never describe it literally.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Alex AI request received with cognitive architecture');
    const requestBody = await req.json();
    
    const model = requestBody.model || 'gpt-4o-mini';
    const temperature = requestBody.temperature !== undefined ? requestBody.temperature : 0.5;
    const userMessages = requestBody.messages || [];
    const currentImage = requestBody.image;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing request with cognitive architecture:', {
      model,
      temperature,
      messagesCount: userMessages.length,
      hasImage: !!currentImage
    });

    // HISTORY CLEANING & COGNITIVE PREPARATION
    const messagesForOpenAI: any[] = [];

    // Step 1: Always start with Alex's Cognitive Constitution
    messagesForOpenAI.push({
      role: "system",
      content: ALEX_COGNITIVE_CONSTITUTION
    });

    // Step 2: Add cleaned text-only history (excluding the last message)
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
        // Create multimodal message with both text and image for cognitive analysis
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
      // No messages but image provided - create initial cognitive analysis
      messagesForOpenAI.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze my style using your cognitive framework and provide your expert guidance."
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

    console.log('Sending to OpenAI with cognitive architecture and', messagesForOpenAI.length, 'messages');

    // Create streaming response with cognitive processing
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
          console.error('Cognitive streaming error:', error);
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
    console.error('Error in Alex cognitive function:', error);
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
