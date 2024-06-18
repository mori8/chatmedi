import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpOnSquareIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

const ChatTextArea: React.FC<Props> = ({ content, setContent }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (e.target.value === '') {
        textareaRef.current.style.height = '20px';
      } else {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        if (textareaRef.current.scrollHeight > 10 * parseFloat(getComputedStyle(textareaRef.current).lineHeight)) {
          textareaRef.current.style.height = `${10 * parseFloat(getComputedStyle(textareaRef.current).lineHeight)}px`;
        }
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      if (content === '') {
        textareaRef.current.style.height = '20px';
      } else {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        if (textareaRef.current.scrollHeight > 10 * parseFloat(getComputedStyle(textareaRef.current).lineHeight)) {
          textareaRef.current.style.height = `${10 * parseFloat(getComputedStyle(textareaRef.current).lineHeight)}px`;
        }
      }
    }
  }, [content]);

  return (
    <div className='flex items-start border-2 border-palatinate rounded-2xl p-3 w-full gap-4'>
      <ArrowUpOnSquareIcon width={24} height={24} className='text-slate-900' />
      <textarea
        ref={textareaRef}
        className="flex-1 outline-none resize-none overflow-auto"
        placeholder="Ask me a question!"
        value={content}
        onChange={handleChange}
        rows={1}
        style={{ minHeight: '16px', maxHeight: `${10 * parseFloat(getComputedStyle(document.documentElement).lineHeight)}px` }}
      />
      <PaperAirplaneIcon width={24} height={24} className='text-slate-900' />
    </div>
  );
};

export default ChatTextArea;
