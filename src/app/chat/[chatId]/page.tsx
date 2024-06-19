'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { chatState } from '@/recoil/atoms';
import ChatTextArea from '@/components/ChatTextArea';

function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const userId = "kaithape"
  const chat = useRecoilValue(chatState);
  const setChat = useSetRecoilState(chatState);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'user', text: chat.prompt }
  ]);

  const handleSubmit = useCallback(async () => {
    if (content.trim() === '') return;

    setMessages((prev) => [...prev, { sender: 'user', text: content }]);
    setContent('');
  
    const response = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId, prompt: content, history: messages.map(m => m.text) }),
    });
    console.log('response:', response);
    const data = await response.json();
    console.log(data);
    setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
  }, [content, messages, chat.userId, chatId]);

  return (
    <div className="flex flex-col h-screen p-5">
      <h1 className="text-2xl font-bold">Chat ID: {chatId}</h1>
      <div className="flex-grow overflow-auto mt-4 p-4 border border-gray-300 rounded-lg">
        {messages.map((message, index) => (
          <div key={index} className={`p-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-1 rounded-lg ${message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <ChatTextArea content={content} setContent={setContent} handleSubmit={handleSubmit} />
    </div>
  );
};

export default ChatPage;
