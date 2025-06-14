
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
    const body = await req.json();
    const { capturedImage, messages } = body;
    
    console.log('Received style analysis request');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Handle initial request with captured image
    if (capturedImage) {
      console.log('Processing initial image analysis...');
      
      // Mock style advice response for initial analysis
      const mockAdvice = {
        analysis: "Based on your photo, I can see you have a warm skin tone and natural features that would work well with earthy colors. Try incorporating warm colors like burgundy, olive green, or burnt orange into your wardrobe. Consider accessories in gold tones rather than silver to complement your warm undertones."
      };

      return new Response(JSON.stringify(mockAdvice), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle follow-up conversation with messages array
    if (messages && Array.isArray(messages)) {
      console.log('Processing follow-up conversation...', messages);
      
      // Mock follow-up response
      const mockFollowUpResponse = {
        response: "That's a great question! A red jacket would add a bold pop of color and create a very confident look. It would pair nicely with the other elements we discussed earlier and really make your warm undertones shine."
      };

      return new Response(JSON.stringify(mockFollowUpResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If neither capturedImage nor messages is provided
    return new Response(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in style-advisor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
