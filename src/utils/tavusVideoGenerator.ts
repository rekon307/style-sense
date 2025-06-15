
import { supabase } from '@/integrations/supabase/client';

export interface VideoGenerationRequest {
  greeting: string;
  styleContext: string;
  userName?: string;
  campaignId?: string;
  callbackUrl?: string;
}

export const generatePersonalizedVideo = async (request: VideoGenerationRequest) => {
  try {
    console.log('=== GENERATING PERSONALIZED STYLE VIDEO ===');
    console.log('Request:', request);

    const { data, error } = await supabase.functions.invoke('tavus-integration', {
      body: {
        action: 'generate_video',
        data: request
      }
    });

    if (error) {
      console.error('Error generating video:', error);
      throw error;
    }

    console.log('✅ Video generation response:', data);
    return data;
  } catch (error) {
    console.error('Failed to generate personalized video:', error);
    throw error;
  }
};

export const createStyleAdviceVideo = async (
  userMessage: string,
  styleAnalysis: string,
  userName?: string
) => {
  const greeting = `Hello ${userName || 'there'}! I've analyzed your style question and I'm excited to share my insights with you.`;
  
  const styleContext = `User's question: "${userMessage}"\n\nStyle analysis: ${styleAnalysis}`;

  return generatePersonalizedVideo({
    greeting,
    styleContext,
    userName,
    callbackUrl: `${window.location.origin}/api/tavus-callback`
  });
};

export const createWelcomeVideo = async (userName?: string) => {
  const greeting = `Welcome to Style Sense, ${userName || 'fashion enthusiast'}! I'm Alex, your AI style advisor. I'm here to help you discover your personal style, analyze your outfits, and provide fashion guidance tailored just for you.`;

  const styleContext = "Introduction and welcome message for new users to Style Sense application.";

  return generatePersonalizedVideo({
    greeting,
    styleContext,
    userName
  });
};
