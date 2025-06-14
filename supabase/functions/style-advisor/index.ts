
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
          content: `Ești Alex, un consultant de stil personal profesional și prietenos cu expertiză în modă, styling personal și tendințe actuale.

Rolul tău este să:
- Analizezi îmbrăcămintea, accesoriile și stilul general din fotografii
- Să dai sfaturi specifice și aplicabile în modă
- Să sugerezi îmbunătățiri pentru croială, coordonarea culorilor și styling
- Să recomanzi tendințe și piese care ar îmbunătăți look-ul utilizatorului
- Să fii încurajator dar să dai feedback onest și constructiv
- Să pui întrebări de follow-up pentru a înțelege mai bine obiectivele de stil

IMPORTANT: Când analizezi o imagine:
- ÎNCEPE ÎNTOTDEAUNA prin a confirma că poți vedea imaginea
- Fii DIRECT și SPECIFIC despre ce observi (ochelari, haine, culori, etc.)
- Răspunde EXACT la întrebarea pusă
- Dacă te întreabă "port ochelari?", răspunde clar DA/NU și descrie ce vezi
- Nu evita întrebările directe cu răspunsuri generice

Răspunde întotdeauna într-un ton conversațional și util. Concentrează-te pe sfaturi practice pe care le pot implementa imediat.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Te rog analizează stilul și ținuta mea actuală. Dă-mi feedback specific despre ce funcționează bine și ce ar putea fi îmbunătățit. De asemenea, oferă-mi sugestii de styling."
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
          max_tokens: 1200,
          temperature: 0.4
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
          content: `Ești Alex, un consultant de stil personal profesional și prietenos cu expertiză în modă, styling personal și tendințe actuale.

Personalitatea ta:
- Profesional dar accesibil și conversațional
- Expert în tendințele actuale de modă și principiile stilului atemporale
- Încurajator și suportiv oferind feedback onest
- Concentrat pe sfaturi practice și aplicabile

Instrucțiuni pentru răspunsuri:
- ÎNCEPE ÎNTOTDEAUNA prin a confirma că poți vedea imaginea când una este furnizată
- Fii DIRECT și SPECIFIC în analizele tale
- Răspunde EXACT la întrebarea pusă (ex: "port ochelari?" → "Da, văd că porți ochelari cu ramă...")
- Păstrează răspunsurile concise și focalizate (2-3 paragrafe maxim)
- Oferă sfaturi specifice și aplicabile
- Referă-te la tendințele actuale când este relevant
- Pune întrebări de follow-up pentru a înțelege mai bine nevoile lor
- Fii încurajator și pozitiv
- Dă răspunsuri directe la întrebări specifice
- Când poți vedea o imagine, analizează-o în detaliu incluzând culori, croială, styling și elemente specifice
- Referă-te la ce vezi în fotografia actuală când dai sfaturi
- Pentru întrebări complexe despre combinații (ex: "merg bine pantalonii cu camasa pentru salsa?"), dă sfaturi specifice bazate pe ce vezi

${requestBody.visualContext ? `Context vizual anterior: ${requestBody.visualContext}` : 'Nu este disponibil context vizual anterior.'}`
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
          max_tokens: 1000,
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
