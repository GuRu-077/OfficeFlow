import { userRepository } from "../repositories/UserRepository.js";
import { signMockToken } from "../utils/auth.js";
import { UnauthorizedError } from "../utils/errors.js";

export class AuthService {
  async login(email, password) {
    // In a real application, you would verify the password hash here.
    // Since this is a mock using hardcoded emails from the frontend, we bypass password check.
    const user = await userRepository.findByEmail(email);
    if (!user || user.status !== "active") {
      throw new UnauthorizedError("Invalid credentials or inactive account");
    }

    const token = signMockToken(user);
    return { user, token };
  }
}

export const authService = new AuthService();
