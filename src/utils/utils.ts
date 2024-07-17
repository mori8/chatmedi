export function extractImageURL(message: string): string[] {
  const imagePattern = new RegExp(
    /(http(s?):|\/)?([\.\/_\w:-])*?\.(jpg|jpeg|tiff|gif|png)/gi
  );
  const imageUrls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = imagePattern.exec(message)) !== null) {
    if (!imageUrls.includes(match[0])) {
      imageUrls.push(match[0]);
    }
  }

  return imageUrls;
}

export async function saveUserMessageForClient(
  userId: string,
  chatId: string,
  text: string,
  file: File | null
): Promise<UserMessage> {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("chatId", chatId);
  formData.append("text", text);
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch("/api/message/user", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error saving user message: ${error.error}`);
  }

  const userMessage = await response.json();
  return userMessage;
}

export async function saveAIMessageForClient(
  userId: string,
  chatId: string,
  response: ChatMediResponse
): Promise<AIMessage> {
  const requestBody = {
    userId,
    chatId,
    response,
  };

  const res = await fetch("/api/message/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Error saving AI message: ${error.error}`);
  }

  const aiMessage = await res.json();
  return aiMessage;
}

export const TasksHandledByDefaultLLM = [
  "question-answering-about-medical-domain",
  "summarization",
];

export const isUserMessage = (message: Message): message is UserMessage => {
  return (message as UserMessage).prompt !== undefined;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}. ${month}. ${day}.  ${hours}. ${minutes}. ${seconds}`;
};

export const parseTimestamp = (timestamp: string): Date => {
  const [datePart, timePart] = timestamp.split("  ");
  const [year, month, day] = datePart.split(". ").map(Number);

  let hours = 0, minutes = 0, seconds = 0;
  if (timePart) {
    [hours, minutes, seconds] = timePart.split(". ").map(Number);
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
};