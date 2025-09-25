import cloudinary from "./cloudinary";
import streamifier from "streamifier";

export async function uploadToCloudinary(fileBuffer, mimetype) {
  return new Promise((resolve, reject) => {
    let resourceType = "image";
    let folderName = "images";

    const options = {
      folder: `${process.env.CLOUDINARY_FOLDER}/${folderName}`,
      resource_type: "image",
    };

    if (mimetype.startsWith("video")) {
      resourceType = "video";
      folderName = "videos";
      options.folder = `${process.env.CLOUDINARY_FOLDER}/videos`;
      options.resource_type = "video";
    } else if (mimetype.includes("pdf")) {
      resourceType = "auto";
      folderName = "pdfs";
      options.folder = `${process.env.CLOUDINARY_FOLDER}/pdfs`;
      options.resource_type = "auto";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId, type) {
  try {
    let resourceType = "image"; // default

    if (type === "video") resourceType = "video";
    else if (type === "pdf") resourceType = "raw"; 

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error("Cloudinary deletion failed: " + error.message);
  }
}
