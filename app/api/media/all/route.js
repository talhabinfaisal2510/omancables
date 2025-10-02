import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";

// GET endpoint to fetch all media items
export async function GET(req) {
  try {
    await dbConnect();

    // Fetch all media items
    const media = await Media.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, media }, { status: 200 });
  } catch (err) {
    console.error("Fetch all media error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}