import { NextResponse } from "next/server";
import { roomService } from "@/services/RoomService";
import { successResponse, errorResponse } from "@/utils/response";
import { createRoomSchema } from "@/validations";
import { ZodError } from "zod";

export async function GET() {
  try {
    const rooms = await roomService.getAllRooms();
    return successResponse(rooms);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = createRoomSchema.parse(body);
    const newRoom = await roomService.createRoom(validatedData);
    return successResponse(newRoom, 201);
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
