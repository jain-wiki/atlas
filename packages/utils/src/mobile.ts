import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile'


export function formatMobile(mobNo: string | undefined) {
  if (!mobNo) { return undefined }
  const phoneNumber = parsePhoneNumberFromString(mobNo);
  if (!phoneNumber) { return undefined }
  return phoneNumber.format('E.164').replace('+', '');
}
