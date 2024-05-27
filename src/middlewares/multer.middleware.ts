import path from 'path'
import fs from 'fs'
import multer from 'multer'

const storage = multer.diskStorage({
    // Set the destination folder for the uploaded files
  destination: (req, file, cb) => {
    const uploadDir = '/public/temp/'
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  // Set the filename for the uploaded files
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ storage })

export default upload
