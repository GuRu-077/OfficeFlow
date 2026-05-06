import { NextResponse } from "next/server";
import { authService } from "@/services/AuthService";
import { successResponse, errorResponse } from "@/utils/response";
import { loginSchema } from "@/validations";
import { ZodError } from "zod";

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const result = await authService.login(
      validatedData.email,
      validatedData.password,
    );
    const response = successResponse(result);
    response.cookies.set({
      name: "auth_token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return response;
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
