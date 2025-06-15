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
      case 'end_conversation':
        response = await endConversation(data.conversation_id, tavusApiKey);
        break;
      case 'generate_video':
        response = await generateVideo(data, tavusApiKey);
        break;
      case 'get_conversation_status':
        response = await getConversationStatus(data.conversation_id, tavusApiKey);
        break;
      case 'list_replicas':
        response = await listReplicas(tavusApiKey);
        break;
      case 'cleanup_conversations':
        response = await cleanupConversations(tavusApiKey);
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

async function endConversation(conversationId: string, apiKey: string) {
  console.log('=== ENDING TAVUS CONVERSATION ===');
  console.log('Conversation ID:', conversationId);
  console.log('Using API endpoint: https://tavusapi.com/v2/conversations/' + conversationId + '/end');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Tavus API response status:', response.status);
    console.log('Tavus API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Failed to end conversation:', response.status, responseText);
      throw new Error(`Failed to end conversation: ${response.status} - ${responseText}`);
    }

    const result = responseText ? JSON.parse(responseText) : { success: true };
    console.log('✅ Conversation ended successfully:', JSON.stringify(result, null, 2));
    return result;
  } catch (fetchError) {
    console.error('=== FETCH ERROR DETAILS ===');
    console.error('Error name:', fetchError.name);
    console.error('Error message:', fetchError.message);
    console.error('Error cause:', fetchError.cause);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds. Please check your network connection and try again.');
    }
    
    throw new Error(`Network error calling Tavus API: ${fetchError.message}`);
  }
}

async function cleanupConversations(apiKey: string) {
  console.log('=== CLEANING UP OLD CONVERSATIONS ===');
  
  try {
    // First, get all conversations
    const listResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!listResponse.ok) {
      console.error('Failed to list conversations:', listResponse.status);
      return { success: false, error: 'Failed to list conversations' };
    }

    const conversations = await listResponse.json();
    console.log('Found conversations:', conversations.length || 0);

    let cleanedUp = 0;
    
    // Clean up old or inactive conversations
    if (conversations.data && Array.isArray(conversations.data)) {
      for (const conversation of conversations.data) {
        try {
          // Delete conversations that are not active or are older than 1 hour
          const conversationAge = new Date().getTime() - new Date(conversation.created_at).getTime();
          const oneHourInMs = 60 * 60 * 1000;
          
          if (conversation.status !== 'active' || conversationAge > oneHourInMs) {
            console.log(`Deleting conversation ${conversation.conversation_id} (status: ${conversation.status}, age: ${Math.round(conversationAge / 1000 / 60)}min)`);
            
            const deleteResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversation.conversation_id}`, {
              method: 'DELETE',
              headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
              },
            });

            if (deleteResponse.ok) {
              cleanedUp++;
              console.log(`✅ Deleted conversation ${conversation.conversation_id}`);
            } else {
              console.log(`❌ Failed to delete conversation ${conversation.conversation_id}`);
            }
          }
        } catch (deleteError) {
          console.error('Error deleting conversation:', deleteError.message);
        }
      }
    }

    console.log(`✅ Cleanup completed. Removed ${cleanedUp} conversations`);
    return { success: true, cleanedUp };
  } catch (error) {
    console.error('=== CLEANUP ERROR ===');
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function listReplicas(apiKey: string) {
  console.log('=== LISTING TAVUS REPLICAS ===');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log('Fetching available replicas...');
    const response = await fetch('https://tavusapi.com/v2/replicas', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Tavus API response status:', response.status);
    const responseText = await response.text();
    console.log('Raw Tavus API response:', responseText);

    if (!response.ok) {
      console.error('Failed to list replicas:', response.status, responseText);
      throw new Error(`Failed to list replicas: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('✅ Replicas listed successfully:', JSON.stringify(result, null, 2));
    return result;
  } catch (fetchError) {
    console.error('=== FETCH ERROR DETAILS ===');
    console.error('Error name:', fetchError.name);
    console.error('Error message:', fetchError.message);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds.');
    }
    
    throw new Error(`Network error calling Tavus API: ${fetchError.message}`);
  }
}

async function createConversation(data: any, apiKey: string) {
  console.log('=== CREATING TAVUS CONVERSATION ===');
  
  // First try to cleanup old conversations to free up slots
  try {
    console.log('Attempting to cleanup old conversations first...');
    await cleanupConversations(apiKey);
  } catch (cleanupError) {
    console.log('Cleanup failed, but continuing with conversation creation:', cleanupError.message);
  }
  
  // Use persona_id (as per your working curl command) or fall back to replica_id
  const personaId = data.persona_id || data.replica_id || "p347dab0cef8";
  
  const payload = {
    persona_id: personaId
  };

  // Add optional conversation properties if provided
  if (data.conversation_name) {
    payload.conversation_name = data.conversation_name;
  }
  
  if (data.conversational_context) {
    payload.conversational_context = data.conversational_context;
  }

  // Add conversation properties with correct format - use "English" instead of "en"
  payload.properties = {
    max_call_duration: data.properties?.max_call_duration || 1800, // 30 minutes
    participant_left_timeout: data.properties?.participant_left_timeout || 60,
    participant_absent_timeout: data.properties?.participant_absent_timeout || 60,
    enable_recording: data.properties?.enable_recording || false,
    enable_transcription: data.properties?.enable_transcription || true,
    language: "English" // Always use full language name, not ISO code
  };

  console.log('Creating conversation with payload:', JSON.stringify(payload, null, 2));
  console.log('Using API endpoint: https://tavusapi.com/v2/conversations');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    console.log('Making request to Tavus API...');
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
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
      
      // If we get a concurrent conversations error, try cleanup and retry once
      if (response.status === 400 && responseText.includes('maximum concurrent conversations')) {
        console.log('⚠️ Hit concurrent conversation limit, attempting aggressive cleanup and retry...');
        
        try {
          await cleanupConversations(apiKey);
          console.log('Retrying conversation creation after cleanup...');
          
          // Retry the request
          const retryResponse = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const retryResponseText = await retryResponse.text();
          
          if (retryResponse.ok) {
            const retryResult = JSON.parse(retryResponseText);
            console.log('✅ Retry successful:', JSON.stringify(retryResult, null, 2));
            return retryResult;
          } else {
            console.error('Retry also failed:', retryResponse.status, retryResponseText);
          }
        } catch (retryError) {
          console.error('Retry attempt failed:', retryError.message);
        }
        
        throw new Error(`Failed to create conversation: ${response.status} - Maximum concurrent conversations reached. Please try again in a few minutes.`);
      }
      
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
