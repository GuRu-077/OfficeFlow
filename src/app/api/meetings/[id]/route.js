import { meetingService } from "@/services/MeetingService";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const meeting = await meetingService.getMeetingById(id);
    return successResponse(meeting);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedMeeting = await meetingService.updateMeeting(id, body);
    return successResponse(updatedMeeting);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await meetingService.cancelMeeting(id);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
