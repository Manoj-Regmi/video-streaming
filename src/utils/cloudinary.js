import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUDINRY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // Upload file in cludinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        //file uploaded successfully
        console.log('File is uploaded on cludinary: ', response.url);
        return response;
    } catch(error) {
        fs.unlinkSync(localFilePath); // remove locally saved temporary file as opration got failed
        return null;
    }
}

export { uploadOnCloudinary }