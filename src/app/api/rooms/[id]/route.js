import { NextResponse } from "next/server";
import { roomService } from "@/services/RoomService";
import { successResponse, errorResponse } from "@/utils/response";
import { updateRoomSchema } from "@/validations";
import { ZodError } from "zod";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const room = await roomService.getRoomById(id);
    return successResponse(room);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRoomSchema.parse(body);
    const updatedRoom = await roomService.updateRoom(id, validatedData);
    return successResponse(updatedRoom);
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await roomService.deleteRoom(id);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
