const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Helper to upload a file to Cloudinary with SAMADHAN folder structure rules.
 * @param {Object} file - The file object from Multer (contains buffer, mimetype)
 * @param {String} context - The context of the upload: 'issues', 'before-work', 'after-work', 'test'
 * @param {String} id - The ID of the issue or verification
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadToCloudinary = (file, context, id) => {
  return new Promise((resolve, reject) => {
    if (!cloudinary || !cloudinary.config().cloud_name) {
      return reject(new Error("Cloudinary is not configured"));
    }

    // Determine resource type and folder suffix based on mimetype
    let resourceType = "auto";
    let folderSuffix = "images";
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
      folderSuffix = "images";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
      folderSuffix = "videos";
    }

    // Build the folder path
    let folderPath = "samadhan";
    let publicIdPrefix = "file";

    if (context === "issues") {
      folderPath = `samadhan/issues/${id}/${folderSuffix}`;
      publicIdPrefix = `issue-${id}`;
    } else if (context === "before-work") {
      folderPath = `samadhan/verifications/before-work/${id}/${folderSuffix}`;
      publicIdPrefix = `verification-${id}`;
    } else if (context === "after-work") {
      folderPath = `samadhan/verifications/after-work/${id}/${folderSuffix}`;
      publicIdPrefix = `verification-${id}`;
    } else if (context === "work-execution") {
      folderPath = `samadhan/work-execution/${id}/${folderSuffix}`;
      publicIdPrefix = `progress-${id}`;
    } else if (context === "test") {
      folderPath = "samadhan/test";
      publicIdPrefix = `test-${id}`;
    }

    const timestamp = Date.now();
    const publicId = `${publicIdPrefix}-${timestamp}`;

    const uploadOptions = {
      folder: folderPath,
      public_id: publicId,
      resource_type: resourceType,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

/**
 * Helper to delete a file from Cloudinary (used for cleanup).
 * @param {String} publicId - The public ID of the asset
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - The Cloudinary deletion result
 */
const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    if (!cloudinary || !cloudinary.config().cloud_name) {
      return resolve({ result: "skipped - not configured" });
    }

    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error(
            "Cloudinary asset cleanup failed:",
            error.name || "Error",
          );
          resolve({ result: "error", error }); // Resolve rather than reject to not break cleanup flows
        } else {
          resolve(result);
        }
      },
    );
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
