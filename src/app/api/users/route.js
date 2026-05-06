import { userRepository } from "@/repositories/UserRepository";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET() {
  try {
    const users = await userRepository.findAll();
    return successResponse(users);
  } catch (error) {
    return errorResponse(error);
  }
}
