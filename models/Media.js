import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true }, // image | pdf | qr | video | audio
    url: { type: String }, // CDN/storage URL
    websiteUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
