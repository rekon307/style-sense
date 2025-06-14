
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
    const { capturedImage } = await req.json();
    
    console.log('Received style analysis request');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock style advice response
    const mockAdvice = {
      analysis: "Based on your photo, I can see you have a warm skin tone and natural features that would work well with earthy colors.",
      suggestions: [
        "Try incorporating warm colors like burgundy, olive green, or burnt orange into your wardrobe",
        "Consider accessories in gold tones rather than silver to complement your warm undertones",
        "A structured blazer would enhance your natural silhouette",
        "Earth-tone scarves or jewelry would add sophistication to your look"
      ],
      hairstyle: "Your face shape would suit a layered cut with soft waves to frame your features beautifully"
    };

    return new Response(JSON.stringify(mockAdvice), {
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
