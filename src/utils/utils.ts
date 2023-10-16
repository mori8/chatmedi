export const hash = (str: string) => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) { 
    chr   = str.charCodeAt(i); 
    hash  = ((hash << 5) - hash) + chr; 
    hash |= 0; 
  } 
  return hash;
}

export const numberSuffix = (num: number) => {
  if (num === 1) return `${num}st`
  if (num === 2) return `${num}nd`
  if (num === 3) return `${num}rd`
  return `${num}th`
}
