import { useState } from "react";

const HITTER_REQUIRED_ATTRS = ["accuracy", "power", "contact", "speed", "defense"];
const PITCHER_REQUIRED_ATTRS = ["control", "velocity", "stamina", "fastball", "breaking"];
const REQUIRED_META_FIELDS = [
  "cardCode", "name", "teamId", "role", "grade",
  "overall", "backNumber", "birthDate", "batThrow",
];

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateForm = (form) => {
    const newErrors = {};
    const { meta, attributes } = form;

    REQUIRED_META_FIELDS.forEach((field) => {
      if (!meta[field]) newErrors[field] = "필수 입력 항목입니다.";
    });

    if (attributes) {
      const attrFields =
        meta.role === "HITTER" ? HITTER_REQUIRED_ATTRS :
        meta.role === "PITCHER" ? PITCHER_REQUIRED_ATTRS : [];

      attrFields.forEach((key) => {
        const value = Number(attributes[key]);
        if (isNaN(value) || value <= 0) {
          newErrors[key] = "1 이상 숫자를 입력하세요.";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateForm };
};
