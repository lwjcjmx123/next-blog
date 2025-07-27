import { NextResponse } from "next/server";
import { getResume } from "@/lib/data";

export async function GET() {
  try {
    const resume = await getResume();
    return NextResponse.json(resume);
  } catch (error) {
    console.error("Failed to fetch resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}