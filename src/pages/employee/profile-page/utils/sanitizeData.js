const nameLikeFields = [
  "firstName",
  "middleName",
  "lastName",
  "nickname",
  "birthplace",
  "nationality",
  "name",
  "fname",
  "mname",
  "lname",
  "relationship",
];

function capitalizeWords(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function isEmptyObject(obj) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    !Array.isArray(obj) &&
    Object.values(obj).every(
      (val) => val === "" || val === null || val === undefined
    )
  );
}

export function sanitizeData(data, currentKey = "") {
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeData(item)) // ok for array
      .filter(
        (item) => item !== undefined && item !== null && !isEmptyObject(item)
      );
  }

  if (typeof data === "object" && data !== null) {
    const result = {};
    for (const key in data) {
      const sanitizedValue = sanitizeData(data[key], key); // pass key here
      if (sanitizedValue !== undefined) {
        result[key] = sanitizedValue;
      }
    }
    return result;
  }

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed === "") return undefined;

    if (currentKey === "extensionName") {
      return trimmed.toUpperCase();
    }

    return nameLikeFields.includes(currentKey)
      ? capitalizeWords(trimmed)
      : trimmed;
  }

  return data;
}


