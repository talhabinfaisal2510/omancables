import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Media from "@/models/Media";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const allowedByType = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/mpeg", "video/quicktime"],
  pdf: ["application/pdf"],
  qr: ["image/png", "image/webp", "image/jpeg", "application/pdf"], // QR can be images or PDFs
};

// GET endpoint to fetch media by title
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

    // Find media by exact title match (case-insensitive)
    const media = await Media.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, media }, { status: 200 });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("=== API ROUTE CALLED ===");
    await dbConnect();

    const formData = await req.formData();

    // Get all form data values
    const title = formData.get("title");
    const type = formData.get("type");
    // Try to get file using the type as key first, then fallback to 'file' key
    let file = formData.get(type) || formData.get("file");

    console.log("=== RECEIVED DATA ===");
    console.log("Title:", title);
    console.log("Type:", type);
    console.log("File:", file ? `${file.name} (${file.type})` : "No file");

    // Validation
    if (!file) {
      console.log("ERROR: No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!title?.trim()) {
      console.log("ERROR: No title provided");
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!type?.trim()) {
      console.log("ERROR: No type provided");
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    // Validate file type matches expected MIME types
    const expectedMimeTypes = allowedByType[type];
    if (!expectedMimeTypes) {
      console.log("ERROR: Invalid type:", type);
      return NextResponse.json(
        {
          error: `Invalid type: ${type}. Allowed types: ${Object.keys(
            allowedByType
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!expectedMimeTypes.includes(file.type)) {
      console.log("ERROR: Invalid MIME type:", file.type, "for type:", type);
      return NextResponse.json(
        {
          error: `Invalid file type. Expected ${expectedMimeTypes.join(
            ", "
          )} for type ${type}, got ${file.type}`,
        },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      console.log("ERROR: File too large:", file.size);
      return NextResponse.json(
        { error: "File too large (max 25MB)" },
        { status: 400 }
      );
    }

    console.log("=== UPLOADING TO CLOUDINARY ===");
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, file.type);
    console.log("Cloudinary result:", result.secure_url);

    console.log("=== SAVING TO DATABASE ===");
    console.log("Saving with type:", type); // This should show 'qr' for QR codes

    const doc = await Media.create({
      title: title.trim(),
      type: type.trim(), // Use exact type from frontend - critical line
      url: result.secure_url,
    });

    console.log("=== SAVED DOCUMENT ===");
    console.log("Document type in DB:", doc.type); // This should show 'qr' for QR codes

    return NextResponse.json(
      {
        success: true,
        media: doc,
        fileUrl: result.secure_url,
        public_id: result.public_id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("=== API ERROR ===", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT endpoint to update existing media
export async function PUT(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("id");

    // Enhanced validation to catch invalid ObjectId values
    if (!mediaId || mediaId === '[object Object]' || mediaId === 'undefined' || mediaId === 'null') {
      console.error('Invalid mediaId received:', mediaId);
      return NextResponse.json({ error: "Valid Media ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(mediaId)) {
      console.error('Invalid ObjectId format:', mediaId);
      return NextResponse.json({ error: "Invalid Media ID format" }, { status: 400 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const type = formData.get("type");
    // Try to get file using the type as key first, then fallback to 'file' key
    let file = formData.get(type) || formData.get("file");

    const media = await Media.findById(mediaId);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Handle file upload if new file is provided
    let fileUrl = media.url;
    if (file) {
      const expectedMimeTypes = allowedByType[type];
      if (!expectedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Expected ${expectedMimeTypes.join(", ")} for type ${type}` },
          { status: 400 }
        );
      }

      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, file.type);
      fileUrl = result.secure_url;
    }

    // Update media details
    media.title = title?.trim() || media.title;
    media.type = type?.trim() || media.type;
    media.url = fileUrl;

    await media.save();

    return NextResponse.json({ success: true, media }, { status: 200 });
  } catch (err) {
    console.error("Error updating media:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE endpoint to delete a media item
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("id");

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Optionally, delete from Cloudinary if needed
    // await deleteFromCloudinary(media.public_id);

    await media.remove();

    return NextResponse.json({ success: true, message: "Media deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting media:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}