import { AppError } from "./errors";
import { errorResponse } from "./api-response";

export function handleApiError(error: unknown) {
    if(error instanceof AppError) {
        return errorResponse(
            error.message,
            error.code,
            error.statusCode,
            error.details
        )
    }

    console.error(error)

    return errorResponse(
        "Internal Server error",
        "ITERNAL_SERVER_ERROR",
        500
    )
}