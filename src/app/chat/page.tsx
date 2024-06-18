'use client';

import React, { useState } from 'react';
import ChatSideBar from '@/components/ChatSideBar';
import ChatTextArea from '@/components/ChatTextArea'; // 경로를 실제 파일 위치에 맞게 조정해주세요.

type Props = {}

export default function Page({ }: Props) {
  const bestCaseExamples = [
    "Generate a chest X-ray image with specific characteristics",
    "Finding abnormal points in attached chest X-ray file",
    "Difference between pneumonia and pleural effusion"
  ];

  const [content, setContent] = useState('');

  return (
    <div className="flex h-screen p-4 gap-10">
      <div className='flex-shrink-0'>
        <ChatSideBar />
      </div>
      <div className="max-w-[884px] flex-1 p-5 text-slate-900 leading-snug flex flex-col gap-8">
        <div className="flex-grow overflow-auto">
          <h1 className="text-2xl font-bold">Hello! I'm ChatMedi, your medical assistant AI.</h1>
          <div className="flex items-center mt-5">
            <span role="img" aria-label="waving hand" className="text-xl mr-2">👋</span>
            <p>I'm an AI that can perform general-purpose medical tasks!</p>
          </div>
          <div className="flex items-center mt-5">
            <span role="img" aria-label="paper clip" className="text-xl mr-2">📎</span>
            <p>To attach an X-ray scan or genomic data,<br />hit the clip icon or drag and drop the file into the message box.</p>
          </div>
          <div className="flex items-center mt-5">
            <span role="img" aria-label="thinking face" className="text-xl mr-2">🤔</span>
            <p>I can sometimes give inaccurate or incorrect answers, so please treat my answers with caution.</p>
          </div>
          <div className="mt-10">
            <p>Give me a command in the message box below, or get started with our best case examples ✨:</p>
            <div className="flex flex-row gap-4 mt-5">
              {bestCaseExamples.map((example, index) => (
                <button key={index} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-4 rounded-2xl text-sm text-left leading-tight">{example}</button>
              ))}
            </div>
          </div>
        </div>
        <ChatTextArea content={content} setContent={setContent} />
      </div>
    </div>
  );
}
