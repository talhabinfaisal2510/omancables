import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Bubble from "@/models/Bubble";
import Media from "@/models/Media";

// GET endpoint to fetch a specific bubble by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params; // Extract ID from dynamic route params

    if (!id) {
      return NextResponse.json(
        { error: "Bubble ID is required" },
        { status: 400 }
      );
    }

    const bubble = await Bubble.findById(id).populate('media');

    if (!bubble) {
      return NextResponse.json({ error: "Bubble not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bubble }, { status: 200 });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT endpoint to update a specific bubble by ID
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params; // Extract ID from dynamic route params

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: "Valid Bubble ID is required" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { title, parentBubbleId, mediaId } = data;

    const bubble = await Bubble.findById(id);
    if (!bubble) {
      return NextResponse.json({ error: "Bubble not found" }, { status: 404 });
    }

    // Check if parent bubble exists if parentBubbleId is provided
    if (parentBubbleId && parentBubbleId !== "null" && parentBubbleId !== bubble.parentBubbleId?.toString()) {
      // Prevent circular references
      if (id === parentBubbleId) {
        return NextResponse.json(
          { error: "A bubble cannot be its own parent" },
          { status: 400 }
        );
      }

      const parentBubble = await Bubble.findById(parentBubbleId);
      if (!parentBubble) {
        return NextResponse.json(
          { error: "Parent bubble not found" },
          { status: 404 }
        );
      }
    }

    // Check if media exists if mediaId is provided
    if (mediaId && mediaId !== bubble.media?.toString()) {
      const media = await Media.findById(mediaId);
      if (!media) {
        return NextResponse.json(
          { error: "Media not found" },
          { status: 404 }
        );
      }
    }


    // Check if this bubble has children when trying to add media (skip validation if explicitly allowing parent bubbles to have media)
    if (mediaId && !bubble.media) { // Only check for new media addition, not updates
      const childBubbles = await Bubble.find({ parentBubbleId: id });
      if (childBubbles.length > 0) {
        console.log(`Warning: Adding media to parent bubble ${id} with ${childBubbles.length} children`);
      }
    }

    // Update bubble - handle null values explicitly for media removal
    bubble.title = title?.trim() || bubble.title;
    bubble.parentBubbleId = parentBubbleId === "null" ? null : (parentBubbleId !== undefined ? parentBubbleId : bubble.parentBubbleId);
    bubble.media = mediaId !== undefined ? (mediaId || null) : bubble.media; // Allow explicit null to remove media

    await bubble.save();

    return NextResponse.json({ success: true, bubble }, { status: 200 });
  } catch (err) {
    console.error("Error updating bubble:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE endpoint to delete a specific bubble by ID
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Bubble ID is required" },
        { status: 400 }
      );
    }

    const bubble = await Bubble.findById(id);
    if (!bubble) {
      return NextResponse.json({ error: "Bubble not found" }, { status: 404 });
    }

    // Recursive function to collect all descendant IDs (children, grandchildren, etc.)
    const collectDescendantIds = async (bubbleId) => {
      const children = await Bubble.find({ parentBubbleId: bubbleId }).select('_id');
      let allIds = children.map(child => child._id.toString());

      // Recursively collect descendants of each child
      for (const child of children) {
        const childDescendants = await collectDescendantIds(child._id);
        allIds = allIds.concat(childDescendants);
      }

      return allIds;
    };

    // Get all descendant IDs
    const descendantIds = await collectDescendantIds(id);

    // Delete all descendants first (bottom-up), then the parent
    if (descendantIds.length > 0) {
      await Bubble.deleteMany({ _id: { $in: descendantIds } });
    }
    await Bubble.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Bubble and all descendants deleted successfully",
        deletedCount: descendantIds.length + 1 // +1 for the parent bubble
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting bubble:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}