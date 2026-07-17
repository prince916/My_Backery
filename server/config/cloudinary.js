const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload image buffer or file path to Cloudinary
 * @param {string} fileUri - base64 data URI or file path
 * @param {string} folder - Cloudinary folder name
 * @returns {object} - { public_id, secure_url }
 */
const uploadToCloudinary = async (fileUri, folder = 'mybakery') => {
  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  });
  return { public_id: result.public_id, url: result.secure_url };
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
