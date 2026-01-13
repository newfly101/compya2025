import CryptoJS from "crypto-js";

const SECRET_KEY = "COMPYAFUN-PITCHER";

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
};

export const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
