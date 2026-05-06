import { NextResponse } from "next/server";
import { AppError } from "./errors.js";

export function successResponse(data, status = 200) {
  const response = {
    success: true,
    data,
  };
  return NextResponse.json(response, { status });
}

export function errorResponse(error) {
  let status = 500;
  let message = "Internal Server Error";
  let details = undefined;

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
    if ("details" in error) {
      details = error.details;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  const response = {
    success: false,
    error: message,
    details,
  };

  return NextResponse.json(response, { status });
}
