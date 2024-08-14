import { Request, Response } from 'express'
import mongoose from 'mongoose'
import sanitize from 'mongo-sanitize'

import asyncHandler from '../utils/asyncHandler'
import Video from '../models/video.model'
import APIResponse from '../utils/APIResponse'
import ApiError from '../utils/APIError'

export const getChannelStats = asyncHandler(async (req: Request, res: Response) => {
  const channelId = sanitize(req.params?.id)

  if (!mongoose.isValidObjectId(channelId)) {
    return res.status(400).json(new ApiError('Channel Id is not valid'))
  }

  const stats = await Video.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) }
    },
    {
      $group: {
        _id: '$channel',
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        totalDislikes: { $sum: '$dislikes' },
        totalComments: { $sum: '$comments' }
      }
    }
  ])

  if (!stats.length) {
    return res.status(404).json(new ApiError('No stats found for this channel'))
  }

  return res
    .status(200)
    .json(new APIResponse(200, { stats: stats[0] }, 'Channel stats fetched successfully'))
})

export const getAllVideosUploadedByChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelId = sanitize(req.params?.id)

  if (!mongoose.isValidObjectId(channelId)) {
    return res.status(400).json({ message: 'Channel Id is not valid' })
  }

  const videos = await Video.find({ channel: channelId })

  if (!videos.length) {
    return res.status(404).json(new ApiError('No videos found for this channel'))
  }

  return res.status(200).json(new APIResponse(200, { videos }, 'Videos fetched successfully'))
})
