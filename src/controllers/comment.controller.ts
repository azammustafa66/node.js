import { Request, Response } from 'express'
import mongoose from 'mongoose'
import sanitize from 'mongo-sanitize'

import asyncHandler from '../utils/asyncHandler'
import Comment from '../models/comment.model'
import APIResponse from '../utils/APIResponse'
import ApiError from '../utils/APIError'
import { CustomRequest } from '../types/custom.types'

export const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
  const videoId = sanitize(req.params?.id)
  let { page = 1, limit = 10 } = req.query
  page = Number(page)
  limit = Number(limit)

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json(new ApiError('Video Id is not valid'))
  }

  const comments = await Comment.find({ video: videoId })
    .populate('user', '_id name username email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  return res.status(200).json(new APIResponse(200, { comments }, 'Comments fetched successfully'))
})

const addComment = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { video, comment } = req.body
  const user = req.user?._id

  if (!mongoose.isValidObjectId(video)) {
    return res.status(400).json(new ApiError('Video Id is not valid'))
  }

  const newComment = await Comment.create(
    { video, user, comment },
    { new: true },
    { validateBeforeSave: false }
  )

  if (!newComment) {
    return res.status(500).json(new ApiError('Failed to add comment'))
  }

  return res
    .status(201)
    .json(new APIResponse(201, { comment: newComment }, 'Comment added successfully'))
})
