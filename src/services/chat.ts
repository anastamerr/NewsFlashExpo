import { apiClient, handleResponse } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { ChatMessage, ChatAssistant } from '@/types/api';

export async function sendMessage(
  assistantId: string,
  message: string,
  history: ChatMessage[],
): Promise<ChatMessage> {
  return handleResponse(
    apiClient.post(ENDPOINTS.CHAT.SEND, {
      assistant_id: assistantId,
      message,
      history,
    }),
  );
}

export async function listAssistants(): Promise<ChatAssistant[]> {
  return handleResponse(apiClient.get(ENDPOINTS.CHAT.ASSISTANTS));
}
