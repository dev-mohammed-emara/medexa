export const formatPhoneForPayload = (phoneStr: string) => {
  let cleaned = phoneStr.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.substring(2);
  if (cleaned.length > 0 && !cleaned.startsWith('+')) cleaned = '+' + cleaned;
  return cleaned;
};

export const formatPhoneForDisplay = (phoneStr: string) => {
  if (!phoneStr) return '';
  let cleaned = phoneStr.trim();
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  return cleaned;
};
