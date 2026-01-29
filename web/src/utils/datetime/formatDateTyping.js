export const formatDateTyping = (value) => {
  const digits = value.replace(/\D/g, "");

  let result = "";

  if (digits.length >= 4) {
    result += digits.slice(0, 4);
  } else {
    return digits;
  }

  if (digits.length >= 6) {
    result += "-" + digits.slice(4, 6);
  } else if (digits.length > 4) {
    result += "-" + digits.slice(4);
    return result;
  } else {
    return result;
  }

  if (digits.length >= 8) {
    result += "-" + digits.slice(6, 8);
  } else if (digits.length > 6) {
    result += "-" + digits.slice(6);
    return result;
  } else {
    return result;
  }

  if (digits.length >= 10) {
    result += " " + digits.slice(8, 10);
  } else if (digits.length > 8) {
    result += " " + digits.slice(8);
    return result;
  } else {
    return result;
  }

  if (digits.length >= 12) {
    result += ":" + digits.slice(10, 12);
  } else if (digits.length > 10) {
    result += ":" + digits.slice(10);
    return result;
  }

  return result;
};
