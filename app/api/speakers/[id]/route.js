// app/api/speakers/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Speaker from "@/models/Speaker";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

// GET single speaker by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Speaker ID is required" }, { status: 400 });
    }

    const speaker = await Speaker.findById(id).lean(); // Fetch single speaker

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: speaker }, { status: 200 });
  } catch (err) {
    console.error("GET speaker error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT update speaker by ID
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await req.json();
    const { file, ...speakerData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Speaker ID is required" }, { status: 400 });
    }

    let imageUrl = speakerData.imageUrl; // Keep existing URL by default

    // If new file is provided, upload to Cloudinary
    if (file && file.data) {
      // Convert base64 to buffer
      const base64Data = file.data.split(',')[1]; // Remove data:image/...;base64, prefix
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, file.type);
      imageUrl = result.secure_url; // Update with new URL
    }

    // Check for any time overlap with existing speakers (excluding current one)
    const existingSpeaker = await Speaker.findOne({
      _id: { $ne: id }, // Exclude current speaker being updated
      $or: [
        // Updated speaker starts during existing speaker's time
        {
          startTime: { $lte: speakerData.startTime },
          endTime: { $gt: speakerData.startTime }
        },
        // Updated speaker ends during existing speaker's time
        {
          startTime: { $lt: speakerData.endTime },
          endTime: { $gte: speakerData.endTime }
        },
        // Updated speaker completely encompasses existing speaker
        {
          startTime: { $gte: speakerData.startTime },
          endTime: { $lte: speakerData.endTime }
        }
      ]
    }).lean();

    if (existingSpeaker) { // Prevent overlapping time slots
      return NextResponse.json(
        {
          success: false,
          error: `Time slot overlaps with ${existingSpeaker.name} (${existingSpeaker.startTime} - ${existingSpeaker.endTime}). Only one speaker can be live at a time.`
        },
        { status: 409 }
      );
    }

    if (existingSpeaker) { // Prevent duplicate time slots
      return NextResponse.json(
        {
          success: false,
          error: `Another speaker (${existingSpeaker.name}) is already scheduled for ${speakerData.startTime} - ${speakerData.endTime}. Only one speaker can be live at a time.`
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    // Update speaker with new data
    const speaker = await Speaker.findByIdAndUpdate(
      id,
      {
        ...speakerData,
        imageUrl
      },
      { new: true, runValidators: true }
    ).lean();

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: speaker }, { status: 200 });
  } catch (err) {
    console.error("PUT speaker error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE speaker by ID
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Speaker ID is required" }, { status: 400 });
    }

    const speaker = await Speaker.findByIdAndDelete(id); // Delete speaker

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (err) {
    console.error("DELETE speaker error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}