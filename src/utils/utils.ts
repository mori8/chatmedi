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
