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
