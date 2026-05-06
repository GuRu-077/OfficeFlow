import { NextResponse } from "next/server";
import { resourceService } from "@/services/ResourceService";
import { successResponse, errorResponse } from "@/utils/response";
import { updateResourceSchema } from "@/validations";
import { ZodError } from "zod";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const resource = await resourceService.getResourceById(id);
    return successResponse(resource);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateResourceSchema.parse(body);
    const updatedResource = await resourceService.updateResource(
      id,
      validatedData,
    );
    return successResponse(updatedResource);
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
    await resourceService.deleteResource(id);
    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
