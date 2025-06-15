
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const tavusApiKey = Deno.env.get('TAVUS_API_KEY');

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
    const requestBody = await req.json();
    const { action, data } = requestBody;

    if (!tavusApiKey) {
      throw new Error('Tavus API key not configured');
    }

    console.log('Action:', action);
    console.log('Data:', data);

    let response;

    switch (action) {
      case 'create_conversation':
        response = await createConversation(data);
        break;
      case 'generate_video':
        response = await generateVideo(data);
        break;
      case 'get_conversation_status':
        response = await getConversationStatus(data.conversation_id);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== TAVUS INTEGRATION ERROR ===', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createConversation(data: any) {
  console.log('=== CREATING TAVUS CONVERSATION ===');
  
  const payload = {
    replica_id: data.replica_id || "re8e740a42", // Default replica ID
    persona_id: data.persona_id || "p24293d6", // Default persona ID
    conversation_name: data.conversation_name || "Style Advice Session",
    conversational_context: data.conversational_context || "You are Alex, a sophisticated AI style advisor. Provide personalized fashion advice, analyze outfits, and help users develop their personal style. Be friendly, knowledgeable, and visually perceptive.",
    properties: {
      enable_recording: true,
      max_call_duration: 300, // 5 minutes
      participant_absent_timeout: 60,
      participant_left_timeout: 60
    }
  };

  console.log('Creating conversation with payload:', payload);

  const response = await fetch('https://tavusapi.com/v2/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tavusApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Tavus conversation creation failed:', response.status, errorText);
    throw new Error(`Failed to create conversation: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Conversation created successfully:', result);
  return result;
}

async function generateVideo(data: any) {
  console.log('=== GENERATING TAVUS VIDEO ===');
  
  const payload = {
    data: {
      "@greeting": data.greeting || "Hello! I'm Alex, your AI style advisor. Let's talk about fashion!",
      "@style_context": data.style_context || "",
      "@user_name": data.user_name || "there"
    },
    campaign_id: data.campaign_id,
    callback: data.callback_url
  };

  console.log('Generating video with payload:', payload);

  const response = await fetch('https://tavusapi.com/v1/requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tavusApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Tavus video generation failed:', response.status, errorText);
    throw new Error(`Failed to generate video: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Video generation initiated:', result);
  return result;
}

async function getConversationStatus(conversationId: string) {
  console.log('=== GETTING CONVERSATION STATUS ===');
  console.log('Conversation ID:', conversationId);

  const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tavusApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get conversation status:', response.status, errorText);
    throw new Error(`Failed to get conversation status: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Conversation status retrieved:', result);
  return result;
}
