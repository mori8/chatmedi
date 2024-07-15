import { atom } from 'recoil';

interface ChatState {
  userId: string;
  prompt: string;
  chatId: string;
  file: File | null;
}

export const chatState = atom<ChatState>({
  key: 'chatState',
  default: {
    userId: '',
    prompt: '',
    chatId: '',
    file: null,
  },
});