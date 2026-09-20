export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: unknown
) {
  return Response.json(
    { success: false, error: { message, code, details } },
    { status }
  );
}