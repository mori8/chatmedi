'use client';

import { useEffect, useState } from 'react';

const StreamingResponsePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stream');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let receivedData: any[] = [];
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            try {
              const parsedLine = JSON.parse(line);
              receivedData = [...receivedData, parsedLine];
              setData([...receivedData]); // Update state with new data
            } catch (err) {
              console.error('Error parsing line:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Streaming Response</h1>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default StreamingResponsePage;
