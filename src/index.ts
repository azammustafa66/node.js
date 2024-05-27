import mongoose from 'mongoose'
import 'dotenv/config'

import app from './app'
;(async () => {
  try {
    // Connect to the database
    await mongoose
      .connect(`${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}`)
      .then(() => console.log('Connected to the database'))
      
    app.on('error', (error: any) => {
      console.log(`Express server error: ${error}`)
    })

    // Start the server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`)
    })
  } catch (error: any) {
    // If the database connection fails, log the error and exit the process
    console.error(`Database connection failed: ${error}`)
    process.exit(1)
  }
})()
