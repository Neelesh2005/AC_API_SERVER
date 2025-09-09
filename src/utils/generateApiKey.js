import crypto from "crypto";

export const generateApiKey = () => {
  // Generate a 32-byte random key and convert to hex string
  return crypto.randomBytes(32).toString("hex");
};

// Alternative method using base64
export const generateApiKeyBase64 = () => {
  return crypto.randomBytes(32).toString("base64");
};

// Example usage:
console.log(generateApiKey());
// Output: d4c5b2a1f3e6d8b7c9a4e2f1b5c8d7a6...
