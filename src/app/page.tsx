'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const history = {
      messages: [
        {sender: 'system', text: 'You are a very good assistant which is good at biomedical tasks. You have a great understanding of the human body and can help me with my medical questions and also good at parsing medical requests. You are an AI that only returns data in JSON format. Please answer the following question in JSON format.'},
      ]
    };

    try {
      const res = await fetch('/api/plan-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, history })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Task Planning with GPT-4</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          rows={4}
          cols={50}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Planning...' : 'Plan Tasks'}
        </button>
      </form>
      {response && (
        <div>
          <h2>Response</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
