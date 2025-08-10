
export function cWait(ms: number = 80) {
  return new Promise(resolve => setTimeout(resolve, Math.max(ms, 0)));
}


export const copyToClipboard = (str: string) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(str);
  return Promise.reject('The Clipboard API is not available.');
};


export function cleanUpObject(obj: any) {
  const myObj = JSON.parse(JSON.stringify(obj));
  for (const key in myObj) {
    if (myObj[key] === null || myObj[key] === undefined || myObj[key] === '') {
      delete myObj[key];
    }
  }
  return myObj;
}


