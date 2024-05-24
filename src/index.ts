import 'dotenv/config'

import AppDataSource from './data-source'
import app from './app'

// IIFEfor asynchronous operations
;(async () => {
  try {
    // Attempt to initialize the database connection
    await AppDataSource.initialize()
    console.log('Database connected!')

    // Set up an error handler for the Express app
    app.on('error', (err) => console.error(`Express server error: ${err}`))

    // Retrieve the port from environment variables or default to 8000
    const PORT = process.env.PORT || 8000

    // Start the Express server and listen on the specified port
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error: any) {
    // If the database connection fails, log the error and exit the process
    console.error(`Database connection failed: ${error}`)
    process.exit(1)
  }
})()
