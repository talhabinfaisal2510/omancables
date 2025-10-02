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
        const { file, ...speakerData } = body;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // Convert base64 to buffer
        const base64Data = file.data.split(',')[1]; // Remove data:image/...;base64, prefix
        const buffer = Buffer.from(base64Data, 'base64');

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, file.type);

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
                    error: `A speaker is already scheduled for ${speakerData.startTime} - ${speakerData.endTime}. Only one speaker can be live at a time.`
                },
                { status: 409 } // 409 Conflict status code
            );
        }

        // Create speaker
        const speaker = await Speaker.create({
            ...speakerData,
            imageUrl: result.secure_url,
        });

        return NextResponse.json(
            { success: true, data: speaker },
            { status: 201 }
        );
    } catch (err) {
        console.error("Error creating speaker:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
