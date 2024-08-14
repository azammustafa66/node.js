import { Response } from 'express'
import { isValidObjectId } from 'mongoose'

import asyncHandler from '../utils/asyncHandler'
import { CustomRequest } from '../types/custom.types'
import Tweet from '../models/tweet.model'
import APIResponse from '../utils/APIResponse'

export const createTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json(new APIResponse(400, {}, 'Text is required'))
  }

  const newTweet = await Tweet.create({ text, user: req.user?._id })

  return res
    .status(201)
    .json(new APIResponse(201, { tweet: newTweet }, 'Tweet created successfully'))
})

export const getUserTweets = asyncHandler(async (req: CustomRequest, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    return res.status(401).json(new APIResponse(401, {}, 'Unauthorized'))
  }

  const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 })

  return res.json(new APIResponse(200, { tweets }, 'User tweets fetched successfully'))
})

export const updateTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
  const tweetId = req.params?.id
  const { updatedText } = req.body

  if (!isValidObjectId(tweetId)) {
    return res.status(400).json(new APIResponse(400, {}, 'Tweet Id is not valid'))
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, user: req.user?._id },
    { text: updatedText },
    { new: true }
  )

  if (!updatedTweet) {
    return res.status(404).json(new APIResponse(404, {}, 'Tweet Not found'))
  }

  return res.json(new APIResponse(200, { tweet: updatedTweet }, 'Tweet updated successfully'))
})

export const deleteTweet = asyncHandler(async (req: CustomRequest, res: Response) => {
  const tweetId = req.params?.id

  if (!isValidObjectId(tweetId)) {
    return res.status(400).json(new APIResponse(400, {}, 'Tweet Id is not valid'))
  }

  const deletedTweet = await Tweet.findOneAndDelete({ _id: tweetId, user: req.user?._id })

  if (!deletedTweet) {
    return res.status(404).json(new APIResponse(404, {}, 'Tweet Not found'))
  }

  return res.json(new APIResponse(200, { tweet: deletedTweet }, 'Tweet deleted successfully'))
})
