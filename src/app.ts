import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes'
import tweetRouter from './routes/tweets.routes'
import dashboardRouter from './routes/dashboard.routes'

// Routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/dashboard', dashboardRouter)

export default app
