// app/api/speakers/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Speaker from "@/models/Speaker";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

// GET all speakers
export async function GET() {
    try {
        await dbConnect();

        const speakers = await Speaker.find().sort({ order: 1 }).lean(); // Fetch all speakers sorted by order

        return NextResponse.json({ success: true, data: speakers }, { status: 200 });
    } catch (err) {
        console.error("GET speakers error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { file, popupFile, ...speakerData } = body;

        console.log('=== POST REQUEST START ===');
        console.log('Has file (thumbnail):', !!file);
        console.log('Has popupFile:', !!popupFile);

        if (!file) {
            return NextResponse.json(
                { success: false, error: "Thumbnail image is required" },
                { status: 400 }
            );
        }

        if (!popupFile) {
            return NextResponse.json(
                { success: false, error: "Popup image is required" },
                { status: 400 }
            );
        }

        // Upload main thumbnail image
        console.log('Uploading thumbnail image...');
        const base64Data = file.data.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const result = await uploadToCloudinary(buffer, file.type);
        console.log('Thumbnail uploaded:', result.secure_url);

        // Upload popup image - now required
        console.log('Uploading popup image...');
        const popupBase64Data = popupFile.data.split(',')[1];
        const popupBuffer = Buffer.from(popupBase64Data, 'base64');
        const popupResult = await uploadToCloudinary(popupBuffer, popupFile.type);
        const popupImageUrl = popupResult.secure_url;
        console.log('Popup image uploaded:', popupImageUrl);

        // Check for any time overlap with existing speakers
        const existingSpeaker = await Speaker.findOne({
            $or: [
                // New speaker starts during existing speaker's time
                {
                    startTime: { $lte: speakerData.startTime },
                    endTime: { $gt: speakerData.startTime }
                },
                // New speaker ends during existing speaker's time
                {
                    startTime: { $lt: speakerData.endTime },
                    endTime: { $gte: speakerData.endTime }
                },
                // New speaker completely encompasses existing speaker
                {
                    startTime: { $gte: speakerData.startTime },
                    endTime: { $lte: speakerData.endTime }
                }
            ]
        }).lean();

        if (existingSpeaker) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Time slot overlaps with ${existingSpeaker.name} (${existingSpeaker.startTime} - ${existingSpeaker.endTime}). Only one speaker can be live at a time.`
                },
                { status: 409 }
            );
        }

        console.log('Creating speaker with:', {
            imageUrl: result.secure_url,
            popupImageUrl: popupImageUrl
        });

        const speaker = await Speaker.create({
            ...speakerData,
            imageUrl: result.secure_url,
            popupImageUrl: popupImageUrl,
        });

        console.log('Speaker created:', JSON.stringify(speaker, null, 2));
        console.log('=== POST REQUEST END ===\n');

        return NextResponse.json(
            { success: true, data: speaker },
            { status: 201 }
        );
    } catch (err) {
        console.error("Error creating speaker:", err);
        console.error("Error stack:", err.stack);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
