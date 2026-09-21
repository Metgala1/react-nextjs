import { NextResponse } from "next/server";
import { openapi } from "@/docs/openapi";

export async function GET() {
    return NextResponse.json(openapi)
}