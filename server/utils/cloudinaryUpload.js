const { Readable } = require('stream');
const { cloudinary, initCloudinary } = require('../config/cloudinary');

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function uploadBufferToCloudinary(buffer, options) {
  if (!hasCloudinaryConfig()) {
    throw new Error('Cloudinary env vars are not configured');
  }

  initCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options || {}, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
