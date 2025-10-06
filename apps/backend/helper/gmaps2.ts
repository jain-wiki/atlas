// Helper function to get Place Details from shared Link.

import axios from 'axios';


export async function getPlaceIdFromSharedLink(sharedLink: string) {

  // fetch details form the shared link.
  // Note this link will return 304. We don't need to follow the redirect.
  const response = await axios.get(sharedLink, {
    maxRedirects: 0,
    validateStatus: (status) => status === 302 || status === 200 || status === 304,
  });

  // Sample URL `"https://www.google.co.in/maps/place/Shree+adinath+jain+mandir/@25.2537806,73.6953155,165m/data=!3m1!1e3!4m6!3m5!1s0x39683b7615e44c53:0x228cc5e5b2a4b647!8m2!3d25.2541125!4d73.6948133!16s%2Fg%2F11jszlg20p?entry=tts&g_ep=EgoyMDI1MTAwMS4wIPu8ASoASAFQAw%3D%3D&skid=78b41c12-47f2-45ca-a02f-657c2cc9f361"`
  const redirectedUrl = response.headers.location;
  if (!redirectedUrl) {
    throw new Error('No redirect URL found', { cause: response });
  }

  // 1. Get the cid from the URL
  const cid = extractGoogleMapsCID(redirectedUrl);

  // 2. Extract information from the redirected URL
  // Name is between /place/ and /@
  const name = redirectedUrl.split('/place/')[1].split('/@')[0].replace(/\+/g, ' ');

  // Lattitude and Longitude are between /@ and /data
  const latLngPart = redirectedUrl.split('/@')[1].split('/data')[0];
  const [lat, lng] = latLngPart.split(',').map(coord => parseFloat(coord));
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid latitude or longitude', { cause: response });
  }

  // 3. Get the Response form the redirected URL to get placeID and also Address.
  const placeDetailsResponse = await axios.get(redirectedUrl);
  const placeId = extractPlaceId(placeDetailsResponse.data);
  const address = extractAddress(placeDetailsResponse.data);

  return { name, lat, lng, redirectedUrl, cid };
}



// Regex to find the pattern 0x[hex]:0x[hex] in the URL
const regex = /0x([a-f0-9]+):0x([a-f0-9]+)/i;

function extractGoogleMapsCID(url: string) {
  const match = url.match(regex);

  if (match && match[2]) {
    const hexCID = match[2];
    // Convert hex to BigInt for large numbers
    const decimalCID = BigInt(`0x${hexCID}`).toString();
    return decimalCID;
  } else {
    throw new Error('CID not found in the provided URL.');
  }
}


function extractPlaceId(html: string): string {
  // Using regex get the full URL which starts with `https://search.google.com/local/reviews`

  // HTML is like below:
  // '\n[null,[],null,null,[[3671.527804395336,72.5894749,23.041099700000004],[0,0,0],[1024,768],13.1],null,[\"0qbjaMu3A_KNseMPq_mT-QM\",\"0ahUKEwjL6OqBu4-QAxXyRmwGHav8JD8Q8BcIAigA\",[\"40, Shahibaug Rd.\",\"Bardolpura, Madhupura\",\"Ahmedabad, Gujarat 380016\"],null,[null,null,null,[\"https://search.google.com/local/reviews?placeid\\u003dChIJq744I0CEXjkRmRSLZ_9dtm8\\u0026q\\u003dHutheesing+Jain+Temple\\u0026authuser\\u003d0\\u0026hl\\u003den\\u0026gl\\u003dIN\",\"9,833 reviews\",null,\"0ahUKEwjL6OqBu4-QAxXyRmwGHav8JD8Q6W4IEygA\"],null,null,null,4.6,9833],null,null,null,null,[null,null,23.0410997,72.5894749],\"0x395e84402338beab:0x6fb65dff678b1499\",\"Hutheesing Jain Temple\",null,[\"Jain temple\",\"Place of worship\",\"Tourist attraction\"],\"Bardolpura, Madhupura\",null,null,null,\"Hutheesing Jain Temple, 40, Shahibaug Rd., Bardolpura, Madhupura, Ahmedabad, Gujarat 380016\",null,null,null,null,null,[[[[[2,null,null,null,

  const reviewUrlMatch = html.match(/https:\/\/search\.google\.com\/local\/reviews\?placeid=([^"&]+)/);
  if (reviewUrlMatch && reviewUrlMatch[1]) {
    const reviewUrl = reviewUrlMatch[1];
    return reviewUrl;
  } else {
    return '';
  }

}

function extractAddress(html: string): string {
  // Address is in the HTML meta tag with itemprop="name"
  //  <meta content="Hutheesing Jain Temple · Hutheesing Jain Temple, 40, Shahibaug Rd., Bardolpura, Madhupura, Ahmedabad, Gujarat 380016" itemprop="name">

  const addressMatch = html.match(/<meta content="(.*?)" itemprop="name">/);
  if (addressMatch && addressMatch[1]) {
    const htmlName = addressMatch[1];
    // Remove any leading text before the first dot and space
    const address = htmlName.split('·').slice(1).join('·').trim();
    return address;
  } else {
    return 'Address not found';
  }
}

if (import.meta.main) {
  // const sharedLink = 'https://maps.app.goo.gl/sq1hLcKbaziicbMk8';
  // const { name, lat, lng, redirectedUrl } = await getPlaceIdFromSharedLink(sharedLink);
  // const cid = extractGoogleMapsCID(redirectedUrl);
  // console.log({ name, lat, lng, cid, redirectedUrl });
  const html = await Bun.file('html.txt').text();
  const placeId = extractPlaceId(html);
  const address = extractAddress(html);
  console.log({ placeId, address });

}