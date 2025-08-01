import Config from 'react-native-config';
export const uploadImageToCloudinary = async (fileUri) => {
  // --- IMPORTANT ---
  // Replace with your Cloudinary details
  const CLOUDINARY_CLOUD_NAME = Config.CLAUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = Config.CLAUDINARY_UPLOADS_PRESETS ; // Create an "unsigned" upload preset in Cloudinary settings

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg', // or 'image/png'
    name: 'upload.jpg',
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (data.secure_url) {
      console.log('Image uploaded successfully:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('Cloudinary upload failed:', data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

