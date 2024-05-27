import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
})

const uploadToCloudinary = async (filePath: string) => {
  try {
    if (!filePath) return null
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto'
    })
    fs.unlinkSync(filePath)
    return response
  } catch (error) {
    // Remove the file if it fails to upload to Cloudinary
    fs.unlinkSync(filePath)
    return null
  }
}

export default uploadToCloudinary
