import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { saveAIMessageForClient } from "@/utils/utils";

const useFetchStreamResponse = (
  userId: string,
  chatId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>
) => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [tempChatMediResponse, setTempChatMediResponse] = useState<ChatMediResponse | null>(null);

  const fetchStreamResponse = useCallback(async (prompt: string, fileURL?: string) => {
    try {
      setIsFetching(true);
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("chatId", chatId);
      formData.append("prompt", prompt);
      if (fileURL) {
        formData.append("fileURL", fileURL);
      }

      const response = await fetch(`/api/stream`, {
        method: "POST",
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let tempResponse: ChatMediResponse = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const dataChunks = chunk.trim().split("\n");

        for (const dataChunk of dataChunks) {
          if (dataChunk) {
            const data = JSON.parse(dataChunk);
            tempResponse = { ...tempResponse, ...data };
            setTempChatMediResponse(tempResponse);
          }
        }
      }

      const savedAIMessage = await saveAIMessageForClient(userId, chatId, tempResponse);
      setMessages((prevMessages) => [...prevMessages, savedAIMessage]);
    } finally {
      setIsFetching(false);
      setTempChatMediResponse(null);
    }
  }, [userId, chatId, setMessages]);

  const fetchReStreamResponse = useCallback(async (prompt: string, task: string, modelSelectedByUser: string) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/re-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          task,
          modelSelectedByUser,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let tempResponse: ChatMediResponse = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const dataChunks = chunk.trim().split("\n");

        for (const dataChunk of dataChunks) {
          if (dataChunk) {
            const data = JSON.parse(dataChunk);
            tempResponse = { ...tempResponse, ...data };
            setTempChatMediResponse(tempResponse);
          }
        }
      }

      const savedAIMessage = await saveAIMessageForClient(userId, chatId, tempResponse);
      setMessages((prevMessages) => [...prevMessages, savedAIMessage]);
    } finally {
      setIsFetching(false);
      setTempChatMediResponse(null);
    }
  }, [userId, chatId, setMessages]);

  return { isFetching, tempChatMediResponse, fetchStreamResponse, fetchReStreamResponse };
};

export default useFetchStreamResponse;
