import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";

// GET endpoint to fetch website by title
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { error: "Title parameter is required" },
        { status: 400 }
      );
    }

    // Find website entry by exact title match (case-insensitive)
    const website = await Media.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      websiteUrl: { $exists: true, $ne: null }, // Ensure websiteUrl exists and is not null
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, website }, { status: 200 });
  } catch (err) {
    console.error("Website fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  console.log("🌐 WEBSITE API CALLED");

  try {
    await dbConnect();

    const body = await req.json();
    const { title, websiteUrl, type = "website" } = body;

    console.log("📥 RECEIVED WEBSITE DATA:", { title, websiteUrl, type });
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!websiteUrl?.trim()) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    // Validate and normalize URL format
    let normalizedUrl = websiteUrl.trim();
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + normalizedUrl; // Add https:// prefix if missing
    }

    try {
      new URL(normalizedUrl); // Validate the normalized URL
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please enter a valid website URL" },
        { status: 400 }
      );
    }

    console.log("🔧 NORMALIZED URL:", normalizedUrl);

    // Create website entry using Media model with normalized URL
    const doc = await Media.create({
      title: title.trim(),
      type: type,
      websiteUrl: normalizedUrl, // Use normalized URL instead of original
    });

    console.log("✅ WEBSITE SAVED:", doc);

    return NextResponse.json(
      {
        success: true,
        website: doc,
        websiteUrl: doc.websiteUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Website creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
