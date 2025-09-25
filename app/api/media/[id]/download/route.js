import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";

// GET endpoint to handle media download by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params; // Extract ID from dynamic route params

    console.log("Download request for media ID:", id); // Debug log for media ID

    if (!id) {
      return NextResponse.json(
        { error: "Media ID is required for download" },
        { status: 400 }
      );
    }

    const media = await Media.findById(id);
    console.log("Found media:", media); // Debug log for found media

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (!media.url) {
      return NextResponse.json(
        { error: "No file URL available" },
        { status: 404 }
      );
    }

    // Force download by fetching the file and setting download headers
    const fileResponse = await fetch(media.url);
    const fileBuffer = await fileResponse.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          media.title || "document"
        }.pdf"`, // Force download with filename
        "Content-Length": fileBuffer.byteLength.toString(),
        "Cache-Control": "no-cache", // Prevent caching to ensure fresh download
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
