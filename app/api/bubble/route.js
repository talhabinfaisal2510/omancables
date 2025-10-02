import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Bubble from "@/models/Bubble";
import Media from "@/models/Media";

// GET endpoint to fetch all bubbles or filter by parentBubbleId
// Removed: Single bubble fetch by id - now handled by /bubble/[id] route
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const parentBubbleId = searchParams.get("parentBubbleId");

    // Build query - filter by parentBubbleId if provided
    const query = parentBubbleId 
      ? { parentBubbleId: parentBubbleId === "null" ? null : parentBubbleId }
      : {};

    const bubbles = await Bubble.find(query).populate('media');
    return NextResponse.json({ success: true, bubbles }, { status: 200 });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST endpoint to create a new bubble
export async function POST(req) {
  try {
    await dbConnect();

    const data = await req.json();
    const { title, parentBubbleId, mediaId } = data;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Check if parent bubble exists if parentBubbleId is provided
    if (parentBubbleId && parentBubbleId !== "null") {
      const parentBubble = await Bubble.findById(parentBubbleId);
      if (!parentBubble) {
        return NextResponse.json({ error: "Parent bubble not found" }, { status: 404 });
      }
    }

    // Check if media exists if mediaId is provided
    if (mediaId) {
      const media = await Media.findById(mediaId);
      if (!media) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }
    }

    // Create new bubble
    const bubble = await Bubble.create({
      title: title.trim(),
      parentBubbleId: parentBubbleId === "null" ? null : parentBubbleId || null,
      media: mediaId || null,
    });

    return NextResponse.json({ success: true, bubble }, { status: 201 });
  } catch (err) {
    console.error("Error creating bubble:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}