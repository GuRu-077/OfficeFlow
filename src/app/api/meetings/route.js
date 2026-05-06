import { NextResponse } from "next/server";
import { meetingService } from "@/services/MeetingService";
import { successResponse, errorResponse } from "@/utils/response";
import { createMeetingSchema } from "@/validations";
import { ZodError } from "zod";

export async function GET() {
  try {
    const meetings = await meetingService.getAllMeetings();
    return successResponse(meetings);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // In a real app we'd get requestedBy from the authenticated user context/token
    // For now we'll simulate it or expect it from body if we aren't enforcing full auth yet.
    // Our schema doesn't validate requestedBy currently, so let's allow it through body for now.
    const validatedData = createMeetingSchema.parse(body);
    const newMeeting = await meetingService.createMeeting({
      ...validatedData,
      requestedBy: body.requestedBy || "1", // default to admin if not provided
    });
    return successResponse(newMeeting, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    return errorResponse(error);
  }
}
