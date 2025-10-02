import mongoose from "mongoose";

const BubbleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    parentBubbleId: { type: mongoose.Schema.Types.ObjectId, ref: "Bubble", default: null }, // For parent-child relationship (NULL if it's a top-level bubble)
    media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" }, // Link to Media (for leaf bubbles)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Bubble || mongoose.model("Bubble", BubbleSchema);
