import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // ADJUST: Use your actual dbConnect path
import Home from '@/models/Home';

// ADDED: GET home configuration (video URL)
export async function GET() {
    try {
        await dbConnect();

        // CHANGED: Direct query instead of static method (Turbopack compatibility)
        let home = await Home.findOne();

        // ADDED: Create default if none exists
        if (!home) {
            home = await Home.create({
                videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
            });
        }

        return NextResponse.json({
            success: true,
            data: home
        }, { status: 200 });
    } catch (err) {
        console.error('GET home error:', err);
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}

// CHANGED: Handle both video file upload and direct URL update
export async function PUT(request) {
    try {
        await dbConnect();

        const contentType = request.headers.get('content-type');
        let videoUrl;

        // ADDED: Check if request contains file upload (FormData)
        if (contentType?.includes('multipart/form-data')) {
            const formData = await request.formData();
            const videoFile = formData.get('video');

            if (!videoFile) {
                return NextResponse.json({
                    success: false,
                    error: 'No video file provided'
                }, { status: 400 });
            }

            // ADDED: Convert file to buffer for Cloudinary upload
            const bytes = await videoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // ADDED: Import uploadToCloudinary dynamically
            const { uploadToCloudinary } = await import('@/lib/uploadToCloudinary');

            // ADDED: Upload video to Cloudinary
            const uploadResult = await uploadToCloudinary(buffer, videoFile.type);
            videoUrl = uploadResult.secure_url;

        } else {
            // ADDED: Handle direct URL update (JSON body)
            const body = await request.json();
            videoUrl = body.videoUrl;

            if (!videoUrl || !videoUrl.trim()) {
                return NextResponse.json({
                    success: false,
                    error: 'Video URL is required'
                }, { status: 400 });
            }

            videoUrl = videoUrl.trim();
        }

        // Get singleton instance and update it
        let home = await Home.findOne();

        if (!home) {
            home = await Home.create({ videoUrl });
        } else {
            home.videoUrl = videoUrl;
            await home.save();
        }

        return NextResponse.json({
            success: true,
            data: home
        }, { status: 200 });
    } catch (err) {
        console.error('PUT home error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to update video'
        }, { status: 400 });
    }
}