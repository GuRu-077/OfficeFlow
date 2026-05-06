import { notificationRepository } from "@/repositories/NotificationRepository";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const notifications = await notificationRepository.findByUserId(id);
    return successResponse(notifications);
  } catch (error) {
    return errorResponse(error);
  }
}
