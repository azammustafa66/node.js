import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import pdf from 'pdf-parse'

const app = express()
const viewsPath = path.join(__dirname, '..', 'public')
const upload = multer({ dest: 'uploads/' })

app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, '..', 'public'))) // Serve static files

app.get('/', (req, res) => {
  res.sendFile(path.join(viewsPath, 'index.html'))
})

app.post('/', (req, res) => {
  const formData = req.body
  console.log(formData)

  fs.appendFile('form-data.txt', JSON.stringify(formData) + '\n', (err) => {
    if (err) {
      console.error(err)
      res.status(500).send('Form data could not be saved')
      return res.redirect('/')
    } else {
      res.status(200).send('Form data received')
    }
  })
})

app.get('/upload', (req, res) => {
  res.sendFile(path.join(viewsPath, 'upload-file.html'))
})

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  const file = req.file
  if (!file) {
    return res.status(400).send('No file uploaded')
  }
  const filePath = req.file?.path

  try {
    if (!filePath) {
      return res.status(400).send('Invalid file path')
    }

    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdf(dataBuffer)
    const text = data.text
    console.log(`Text extracted from PDF: ${text}`)

    const txtFilePath = path.join(__dirname, 'extracted_text.txt')
    fs.writeFileSync(txtFilePath, text)

    res.status(200).send('PDF uploaded and text extracted successfully!')
  } catch (error) {
    console.error(`Error extracting text from PDF: ${error}`)
    res.status(500).send('Error extracting text from PDF')
  } finally {
    fs.unlinkSync(filePath!)
  }
})

app.listen(8000, () =>
  console.log('Server is running on http://localhost:8000')
)
