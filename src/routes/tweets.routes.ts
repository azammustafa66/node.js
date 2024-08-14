import { Router } from 'express'
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from '../controllers/tweet.controller'
import verifyToken from '../middlewares/auth.middleware'

const router = Router()

// Create Tweet
router.post('/create-tweet', verifyToken, createTweet)

// Get User's Tweets
router.get('/tweets', verifyToken, getUserTweets)

// Update Tweet (specific tweet ID required)
router.put('/update-tweet/:id', verifyToken, updateTweet)

// Delete Tweet (specific tweet ID required)
router.delete('/delete-tweet/:id', verifyToken, deleteTweet)

export default router
