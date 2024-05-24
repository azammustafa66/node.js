import express from 'express'
import dotenv from 'dotenv'

import AppDataSource from './data-source'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT)
    console.log(
      `Database connected and server running on http://localhost:${process.env.PORT}`
    )
  })
  .catch(() => console.error('Database connection failed!'))
