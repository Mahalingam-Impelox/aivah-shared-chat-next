import CommonAPI from '@/utils/api/common-api';
import { notFound } from 'next/navigation';
import VoiceOnlyClient from './VoiceOnlyClient';

interface PageProps {
  params: {
    uuid: string;
  };
  searchParams: {
    viewType?: string;
    iFrame?: string;
  };
}

interface ValidationResult {
  success: boolean;
  details?: {
    token: string;
    chatType: string;
    chatbotId: number;
    knowledgebaseType: string;
    llmModelId?: string;
    llmModel?: string;
    voiceSetup?: {
      voiceSetup: any;
    };
  };
  error?: string;
}

interface ConversationResult {
  conversationId: string;
  userSessionId: string;
  success: boolean;
  error?: string;
}

export default async function VoiceOnlyPage({ params, searchParams }: PageProps) {
  const { uuid } = await params;
  const { viewType = 'page', iFrame = 'false' } = await searchParams;

  // Validate UUID on the server side
  let validationResult: ValidationResult;
  let conversationResult: ConversationResult | null = null;

  try {
    // Validate UUID
    const details = await CommonAPI.validateUUID(uuid, { enableScene: 1 });
    
    if (!details?.details) {
      notFound();
    }

    validationResult = {
      success: true,
      details: details.details
    };

    // Create conversation on the server side
    const knowledgeBaseId = details.details.chatbotId;

    if (knowledgeBaseId) {
      try {
        // Get IP address for conversation creation
        const ipResponse = await fetch('https://api64.ipify.org/?format=json');
        const ipData = await ipResponse.json();
        const ipAddress = ipData?.ip;

        const response = await CommonAPI.createConversation({
          ipAddress,
          sessionId: Date.now().toString(),
          deliveryType: 'companion'
        }, details?.details?.token);

        conversationResult = {
          conversationId: response?.conversationId || '',
          userSessionId: response?.userSessionId || '',
          success: true
        };
      } catch (error) {
        console.error('Failed to create conversation:', error);
        conversationResult = {
          conversationId: '',
          userSessionId: '',
          success: false,
          error: 'Failed to create conversation'
        };
      }
    }
  } catch (error) {
    console.error('UUID validation failed:', error);
    notFound();
  }

  // Prepare initial data for client component
  const initialData = {
    uuid,
    viewType,
    isIframe: JSON.parse(iFrame),
    validation: validationResult,
    conversation: conversationResult,
    llmModelId: validationResult.details?.knowledgebaseType === 'realtime' 
      ? (validationResult.details?.llmModelId || '') 
      : (validationResult.details?.llmModel || ''),
    configuredVoice: validationResult.details?.voiceSetup?.voiceSetup || null,
    knowledgeBaseId: validationResult.details?.chatbotId || 0
  };

  return <VoiceOnlyClient initialData={initialData} />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Voice Chat Support',
    description: 'Get instant voice support with our AI assistant',
  };
}
