import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== TAVUS INTEGRATION REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { action, data } = requestBody;

    // Get Tavus API key from Supabase environment variables
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    if (!tavusApiKey) {
      console.error('TAVUS_API_KEY environment variable not set in Supabase secrets');
      return new Response(JSON.stringify({ 
        error: 'Tavus API key not configured. Please add TAVUS_API_KEY to Supabase secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Action:', action);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('API Key present:', !!tavusApiKey, 'Length:', tavusApiKey.length);

    let response;

    switch (action) {
      case 'create_conversation':
        response = await createConversation(data, tavusApiKey);
        break;
      case 'generate_video':
        response = await generateVideo(data, tavusApiKey);
        break;
      case 'get_conversation_status':
        response = await getConversationStatus(data.conversation_id, tavusApiKey);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== TAVUS INTEGRATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      details: error.stack,
      errorType: error.name
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createConversation(data: any, apiKey: string) {
  console.log('=== CREATING TAVUS CONVERSATION ===');
  
  // Simplified payload to match working Postman request
  const payload = {
    replica_id: data.replica_id || "r4fa3e64f1",
    conversation_name: data.conversation_name || "Style Sense Video Chat",
    conversational_context: data.conversational_context || "You are Alex, a sophisticated AI style advisor with advanced visual analysis capabilities. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive. Help users understand colors, patterns, and styling techniques.",
    properties: {
      max_call_duration: 600,
      participant_left_timeout: 60,
      participant_absent_timeout: 60,
      enable_recording: false
    }
  };

  console.log('Creating conversation with payload:', JSON.stringify(payload, null, 2));
  console.log('Using API endpoint: https://tavusapi.com/v2/conversations');
  console.log('API Key being used:', apiKey.substring(0, 8) + '...');

  try {
    // Increase timeout to 60 seconds and add retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    console.log('Making request to Tavus API...');
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Tavus conversation creation failed:', response.status, responseText);
      throw new Error(`Failed to create conversation: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Conversation created successfully:', JSON.stringify(result, null, 2));
    return result;
  } catch (fetchError) {
    console.error('=== FETCH ERROR DETAILS ===');
    console.error('Error name:', fetchError.name);
    console.error('Error message:', fetchError.message);
    console.error('Error cause:', fetchError.cause);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds. The Tavus API may be experiencing delays. Please try again.');
    }
    
    throw new Error(`Network error calling Tavus API: ${fetchError.message}`);
  }
}

async function generateVideo(data: any, apiKey: string) {
  console.log('=== GENERATING TAVUS VIDEO ===');
  
  const payload = {
    script: data.greeting || "Hello! I'm Alex, your AI style advisor. Let's talk about fashion!",
    replica_id: data.replica_id || "r4fa3e64f1",
    background_url: data.background_url,
    webhook_url: data.callbackUrl || data.callback_url
  };

  console.log('Generating video with payload:', JSON.stringify(payload, null, 2));
  console.log('Using API endpoint: https://tavusapi.com/v2/videos');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Tavus video generation failed:', response.status, responseText);
      throw new Error(`Failed to generate video: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Video generation initiated:', JSON.stringify(result, null, 2));
    return result;
  } catch (fetchError) {
    console.error('=== FETCH ERROR DETAILS ===');
    console.error('Error name:', fetchError.name);
    console.error('Error message:', fetchError.message);
    console.error('Error cause:', fetchError.cause);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds. Please check your network connection and try again.');
    }
    
    throw new Error(`Network error calling Tavus API: ${fetchError.message}`);
  }
}

async function getConversationStatus(conversationId: string, apiKey: string) {
  console.log('=== GETTING CONVERSATION STATUS ===');
  console.log('Conversation ID:', conversationId);
  console.log('Using API endpoint: https://tavusapi.com/v2/conversations/' + conversationId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Failed to get conversation status:', response.status, responseText);
      throw new Error(`Failed to get conversation status: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Conversation status retrieved:', JSON.stringify(result, null, 2));
    return result;
  } catch (fetchError) {
    console.error('=== FETCH ERROR DETAILS ===');
    console.error('Error name:', fetchError.name);
    console.error('Error message:', fetchError.message);
    console.error('Error cause:', fetchError.cause);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds. Please check your network connection and try again.');
    }
    
    throw new Error(`Network error calling Tavus API: ${fetchError.message}`);
  }
}
