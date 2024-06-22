'use client';

import React, { useRef } from 'react';
import { ArrowUpOnSquareIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
};

function ChatTextArea({ content, setContent, handleSubmit }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAndResetHeight();
    }
  };

  const submitAndResetHeight = () => {
    handleSubmit();
    if (textareaRef.current) {
      setContent('');
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className='flex flex-col w-full gap-4'>
      <div className='flex items-start border-2 border-palatinate rounded-2xl p-3 w-full gap-4'>
        <ArrowUpOnSquareIcon width={24} height={24} className='text-slate-900' />
        <textarea
          ref={textareaRef}
          className="flex-1 outline-none resize-none overflow-auto"
          placeholder="Ask me a question!"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ minHeight: '16px', maxHeight: '200px' }}
        />
        <PaperAirplaneIcon
          width={24}
          height={24}
          className='text-slate-900 cursor-pointer'
          onClick={submitAndResetHeight}
        />
      </div>
    </div>
  );
};

export default ChatTextArea;
