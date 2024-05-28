import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import verifyToken from './middlewares/auth.middleware'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes'

// Routes
app.use('/api/v1/users', userRouter)

export default app
