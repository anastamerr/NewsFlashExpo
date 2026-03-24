import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  draftMessage: string;
  openChat: (draftMessage?: string) => void;
  closeChat: () => void;
  clearDraftMessage: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  draftMessage: '',
  openChat: (draftMessage = '') => set({ isOpen: true, draftMessage }),
  closeChat: () => set({ isOpen: false, draftMessage: '' }),
  clearDraftMessage: () => set({ draftMessage: '' }),
}));
