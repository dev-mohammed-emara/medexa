export const getApiErrorMessages = (err: any, fallbackMessage: string = "Something went wrong"): string[] => {
  if (!err) return [fallbackMessage];

  let obj = err;
  if (typeof err === 'string') {
    try {
      obj = JSON.parse(err);
    } catch {
      return err.trim() !== '' ? [err] : [fallbackMessage];
    }
  }

  if (typeof obj === 'object') {
    let messages: string[] = [];

    // details[].message
    if (obj.details && Array.isArray(obj.details)) {
      messages = obj.details
        .map((d: any) => {
          if (d?.field && d?.message) {
            const fieldName = d.field.split('.').pop() || d.field;
            return `${fieldName}: ${d.message}`;
          }
          return d?.message;
        })
        .filter((m: any) => typeof m === 'string' && m.trim() !== '');
    }
    // details.message (if details is an object)
    else if (obj.details && typeof obj.details === 'object' && obj.details.message && typeof obj.details.message === 'string' && obj.details.message.trim() !== '') {
      messages = [obj.details.message];
    }

    if (messages.length > 0) {
      return messages;
    }

    // message (fallback when details is empty or invalid)
    if (obj.message && typeof obj.message === 'string' && obj.message.trim() !== '') {
      const msg = obj.message.trim();
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('validation') || msgLower.includes('bad request') || msgLower.includes('correct the highlighted')) {
        return ["Validation failed. Please check the highlighted fields and correct the invalid values."];
      }
      return [msg];
    }

    // error
    if (obj.error && typeof obj.error === 'string' && obj.error.trim() !== '') {
      return [obj.error];
    }
  }

  return typeof obj === 'string' && obj.trim() !== '' ? [obj] : [fallbackMessage];
};

export const getErrorMessage = (err: any, fallbackMessage: string = "Something went wrong"): string => {
  const messages = getApiErrorMessages(err, fallbackMessage);
  return messages.join(' || ');
};
