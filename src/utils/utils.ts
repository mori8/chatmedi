export const hash = (str: string) => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) { 
    chr   = str.charCodeAt(i); 
    hash  = ((hash << 5) - hash) + chr; 
    hash |= 0; 
  } 
  return Math.abs(hash);
}

export const numberSuffix = (num: number) => {
  if (num === 1) return `${num}st`
  if (num === 2) return `${num}nd`
  if (num === 3) return `${num}rd`
  return `${num}th`
}

export function extractKeyValuePairs(text: string): { [key: string]: string } {
  const pattern: RegExp = /\[(.*?)\]\s*(.*?)(?=\n\[|$)/gs;
  const matches = [...text.matchAll(pattern)];
  return matches.reduce<{ [key: string]: string }>((acc, match) => {
      const key = match[1].trim();
      const value = match[2].trim();
      acc[key] = value;
      return acc;
  }, {});
}

export const getImageURL = async (imageInputName: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/files/${imageInputName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.blob())
    .then((blob) => {
      const imageURL = URL.createObjectURL(blob);
      return imageURL;
    });
  return res;
};

export const groupByDate = (chatHistory: Chat[]) => {
  const grouped = chatHistory.reduce((acc, chat) => {
    const dateKey = new Date(chat.created_at)
      .toLocaleDateString()
      .split("T")[0];
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(chat);
    return acc;
  }, {} as { [key: string]: Chat[] });

  // 날짜별 정렬 및 채팅 시간별 정렬
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .map(([date, chats]) => ({
      date,
      chats: chats.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));
};

export const randomBGColor = (name: string) => {
  const colors = [
    "bg-[#98C0C6]",
    "bg-[#F8AEAE]",
    "bg-[#6780A6]",
    "bg-[#C4E29D]",
    "bg-[#E26060]",
    "bg-[#E8BFE6]",
    "bg-[#CA4C9F]",
    "bg-[#7DC892]",
    "bg-[#9BE8F2]",
  ];
  return colors[hash(name) % colors.length];
};