import { atom } from 'recoil';

export const chatState = atom({
  key: 'chatState',
  default: {
    userId: '',
    prompt: '',
    chatId: '',
    messageId: '',
  }
});
