
// Sample url
//  `https://maps.google.com/?cid=8801447818467993761&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQABgEIAA`
export function getCidFromGoogleMapsUri(googleMapsUri: string | undefined) {
  if (!googleMapsUri) { return undefined }
  const url = new URL(googleMapsUri);
  return url.searchParams.get('cid') || undefined;
}