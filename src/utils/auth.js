// In a real app, you would use jwt.sign and jwt.verify
// Since this is a mock without external jwt libraries, we'll use base64 encoded strings
// format: base64(JSON.stringify({ userId, role, exp }))

const SECRET = "mock-secret-key"; // Simulated secret

export function signMockToken(user) {
  const payload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24, // 1 day expiration
  };
  // Create a base64 string. In browser/NextJS Edge, btoa is available.
  // In Node, we can use Buffer. We'll use Buffer here since this runs on the server.
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${token}.${SECRET}`; // append secret just to simulate signature
}

export function verifyMockToken(token) {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (signature !== SECRET) {
      return null;
    }

    const payloadString = Buffer.from(payloadBase64, "base64").toString(
      "utf-8",
    );
    const payload = JSON.parse(payloadString);
    if (payload.exp < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch (error) {
    return null;
  }
}
