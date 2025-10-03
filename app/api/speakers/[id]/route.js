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
    const { file, popupFile, ...speakerData } = body;
    console.log('=== PUT REQUEST START ===');
    console.log('Speaker ID:', id);
    console.log('Has file (thumbnail):', !!file);
    console.log('Has popupFile:', !!popupFile);
    console.log('speakerData.imageUrl:', speakerData.imageUrl);
    console.log('speakerData.popupImageUrl:', speakerData.popupImageUrl);
    console.log('speakerData keys:', Object.keys(speakerData));
    if (!id) {
      return NextResponse.json({ success: false, error: "Speaker ID is required" }, { status: 400 });
    }

    const existingSpeaker = await Speaker.findById(id).lean();
    if (!existingSpeaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 });
    }
    console.log('Existing speaker imageUrl:', existingSpeaker.imageUrl);
    console.log('Existing speaker popupImageUrl:', existingSpeaker.popupImageUrl);
    let imageUrl = existingSpeaker.imageUrl;
    let popupImageUrl = existingSpeaker.popupImageUrl || existingSpeaker.imageUrl;
    console.log('Initial imageUrl (from DB):', imageUrl);
    console.log('Initial popupImageUrl (from DB):', popupImageUrl);
    // Upload new thumbnail only if file provided
    if (file && file.data) {
      console.log('Uploading new thumbnail...');
      const base64Data = file.data.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const result = await uploadToCloudinary(buffer, file.type);
      imageUrl = result.secure_url;
    }
    else {
      console.log('No new thumbnail file provided');
    }

    // Upload new popup image only if file provided
    if (popupFile && popupFile.data) {
      console.log('Uploading new popup image...');
      const popupBase64Data = popupFile.data.split(',')[1];
      const popupBuffer = Buffer.from(popupBase64Data, 'base64');
      const popupResult = await uploadToCloudinary(popupBuffer, popupFile.type);
      popupImageUrl = popupResult.secure_url;
      console.log('New popup image uploaded:', popupImageUrl);
    }
    else {
      console.log('No new popup file provided');
    }

    console.log('BEFORE spreading speakerData:');
    console.log('  imageUrl variable:', imageUrl);
    console.log('  popupImageUrl variable:', popupImageUrl);

    // Check for any time overlap with existing speakers (excluding current one)
    const overlappingSpeaker = await Speaker.findOne({
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

    if (overlappingSpeaker) {
      return NextResponse.json(
        {
          success: false,
          error: `Time slot overlaps with ${overlappingSpeaker.name} (${overlappingSpeaker.startTime} - ${overlappingSpeaker.endTime}). Only one speaker can be live at a time.`
        },
        { status: 409 }
      );
    }

    // Update speaker with new data
    const { imageUrl: _, popupImageUrl: __, ...cleanSpeakerData } = speakerData;

    console.log('AFTER removing URLs from speakerData:');
    console.log('  cleanSpeakerData keys:', Object.keys(cleanSpeakerData));
    console.log('  imageUrl to save:', imageUrl);
    console.log('  popupImageUrl to save:', popupImageUrl);

    // Update speaker with new data
    const speaker = await Speaker.findByIdAndUpdate(
      id,
      {
        ...cleanSpeakerData,
        imageUrl,
        popupImageUrl
      },
      { new: true, runValidators: true, strict: false }
    ).lean();

    console.log('Raw speaker object keys:', Object.keys(speaker));
    console.log('speaker.popupImageUrl:', speaker.popupImageUrl);

    if (!speaker) {
      return NextResponse.json({ success: false, error: "Speaker not found" }, { status: 404 });
    }
    console.log('Updated speaker from DB:', JSON.stringify(speaker, null, 2));
    console.log('=== PUT REQUEST END ===\n');
    return NextResponse.json({ success: true, data: speaker }, { status: 200 });
  } catch (err) {
    console.error("PUT speaker error:", err);
    console.error("Error stack:", err.stack);
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