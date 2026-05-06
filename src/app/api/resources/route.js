import { NextResponse } from "next/server";
import { resourceService } from "@/services/ResourceService";
import { successResponse, errorResponse } from "@/utils/response";
import { createResourceSchema } from "@/validations";
import { ZodError } from "zod";

export async function GET() {
  try {
    const resources = await resourceService.getAllResources();
    return successResponse(resources);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = createResourceSchema.parse(body);
    const newResource = await resourceService.createResource(validatedData);
    return successResponse(newResource, 201);
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
