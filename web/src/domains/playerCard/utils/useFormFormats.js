export const useFormFormats = () => {
  // form에서 number로 입력하게 하면, 자동으로 1994-08-22 로 변경하는 method
  const formatBirthDate = (value) => {
    const onlyNumber = value.replace(/\D/g, "").slice(0, 8);

    if (onlyNumber.length < 4) return onlyNumber;
    if (onlyNumber.length < 6)
      return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(4)}`;

    return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(4, 6)}-${onlyNumber.slice(6, 8)}`;
  };

  const parseArray = (value) => {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };

  const stringifyArray = (arr) => JSON.stringify(arr);


  return {
    formatBirthDate,
    parseArray,
    stringifyArray
  }

}
