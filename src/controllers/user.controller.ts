import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import 'dotenv/config'

import User from '../models/user.model'
import {
  CustomRequest,
  IUser,
  DecodedAccessToken,
  DecodedRefreshToken
} from '../types/custom.types'
import ApiError from '../utils/APIError'
import asyncHandler from '../utils/asyncHandler'
import uploadToCloudinary from '../utils/cloudinary'
import APIResponse from '../utils/APIResponse'

const isDesktop = (req: Request) =>
  req.headers['user-agent']?.includes('PostmanRuntime') ||
  req.headers['user-agent']?.includes('Windows') ||
  req.headers['user-agent']?.includes('Macintosh') ||
  req.headers['sec-ch-ua-platform'] === '"Windows"' ||
  req.headers['sec-ch-ua-platform'] === '"macOS"'

const generateTokens = async (user: IUser) => {
  try {
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if (!accessToken || !refreshToken) {
      throw new ApiError('Failed to generate tokens')
    }

    await user.updateOne({ $set: { refreshToken }, validate: false })
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError('Failed to generate tokens')
  }
}

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username, fullName } = req.body

  if ([email, password, username, fullName].some((field) => field?.trim() === '')) {
    return res.status(400).json(new ApiError('All fields are required'))
  }

  const doesExist = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (doesExist) {
    return res.status(409).json(new ApiError('User already exists'))
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  const avatarLocalPath = files?.avatar[0]?.path
  let coverImageLocalPath: string | undefined

  if (files && Array.isArray(files.coverImage) && files.coverImage.length > 0) {
    coverImageLocalPath = files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    return res.status(400).json(new ApiError('Avatar file is required'))
  }

  const avatar = await uploadToCloudinary(avatarLocalPath)
  const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null

  if (!avatar) {
    return res.status(500).json(new ApiError('Failed to upload avatar'))
  }

  try {
    const user = await User.create({
      email,
      password,
      username,
      fullName,
      avatar: avatar.secure_url,
      coverImage: coverImage?.secure_url
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')
    return res.json(new APIResponse(201, createdUser, 'User created successfully'))
  } catch (error) {
    return res.status(500).json(new ApiError('Failed to create user'))
  }
})

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body

  if (!(email || username)) {
    return res.status(400).json(new ApiError('Email or username is required'))
  }

  if (!password) {
    return res.status(400).json(new ApiError('Password is required'))
  }

  const user = await User.findOne({ $or: [{ email }, { username }] })

  if (!user) {
    return res
      .status(404)
      .json(new ApiError('User not found. Please check your email or username or register'))
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    return res.status(401).json(new ApiError('Invalid password'))
  }

  const { accessToken, refreshToken } = await generateTokens(user)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

  return isDesktop(req)
    ? res
        .status(200)
        .cookie('refreshToken', refreshToken, {
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production'
        })
        .cookie('accessToken', accessToken, {
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production'
        })
        .json(new APIResponse(200, loggedInUser, 'User logged in successfully'))
    : res.status(200).json(
        new APIResponse(
          200,
          {
            loggedInUser,
            accessToken,
            refreshToken
          },
          'User logged in successfully'
        )
      )
})

export const logOutUser = asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    if (isDesktop(req)) {
      res.clearCookie('refreshToken', {
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      })
      res.clearCookie('accessToken', {
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
      })
    } else {
      // Remove refresh token from the database and the client will remove the access token from local/session storage
      const { _id } = req.user as DecodedAccessToken
      await User.findByIdAndUpdate(_id, { $set: { refreshToken: '' } })
    }
    res.json(new APIResponse(200, null, 'User logged out successfully')) // Consistent response format
  } catch (error: any) {
    res.status(500).json(new ApiError(error.message || 'Failed to log out user'))
  }
})

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken: string | undefined =
    req.cookies?.refreshToken || req.headers.authorization?.split(' ')[1]

  if (!incomingRefreshToken) {
    return res.status(401).json(new ApiError('Unauthorized'))
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as DecodedRefreshToken

    const user = await User.findOne({ refreshToken: decoded?._id })

    if (!user) {
      return res.status(401).json(new ApiError('Unauthorized'))
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json(new ApiError('Unauthorized'))
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user)

    return isDesktop(req)
      ? res.status(200).cookie('accessToken', accessToken).cookie('refreshToken', newRefreshToken)
      : res.json(
          new APIResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            'Token refreshed successfully'
          )
        )
  } catch (error: any) {
    return res.status(401).json(new ApiError('Unauthorized', error))
  }
})

export const updatePassword = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { currentPassword, newPassword, confPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json(new ApiError('Current and new passwords are required'))
  }

  if (newPassword !== confPassword) {
    return res.status(400).json(new ApiError('Passwords do not match'))
  }

  const { _id } = req.user as DecodedAccessToken

  const user = await User.findById(_id)

  if (!user) {
    return res.status(404).json(new ApiError('User not found'))
  }

  const isPasswordMatch = await user.comparePassword(currentPassword)

  if (!isPasswordMatch) {
    return res.status(401).json(new ApiError('Invalid current password'))
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res.json(new APIResponse(200, {}, 'Password updated successfully'))
})

export const getCurrentUser = asyncHandler(async (req: CustomRequest, res: Response) => {
  return res.status(200).json(new APIResponse(200, req.user, 'User found successfully'))
})

export const updateAccountDetails = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { username, fullName, email } = req.body

  if ([username, fullName, email].some((field) => field?.trim() === '')) {
    return res.status(400).json(new ApiError('All fields are required'))
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { username, fullName, email } },
    { new: true }
  ).select('-password')

  return res.status(201).json(new APIResponse(200, user, 'User updated successfully'))
})

export const updateAvatar = asyncHandler(async (req: CustomRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }
  const avatarLocalPath = files.avatar[0]?.path

  if (!avatarLocalPath) {
    return res.status(400).json(new ApiError('Avatar file is required'))
  }

  const avatar = await uploadToCloudinary(avatarLocalPath)

  if (!avatar) {
    return res.status(500).json(new ApiError('Failed to upload avatar'))
  }

  if (!avatar.secure_url) {
    return res.status(500).json(new ApiError('Failed to upload avatar'))
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.secure_url } },
    { new: true }
  ).select('-password')

  return res.status(201).json(new APIResponse(200, user, 'Avatar updated successfully'))
})

export const updateCoverImage = asyncHandler(async (req: CustomRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }
  const coverImageLocalPath = files.coverImage[0]?.path

  if (!coverImageLocalPath) {
    return res.status(400).json(new ApiError('Cover image file is required'))
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath)

  if (!coverImage) {
    return res.status(500).json(new ApiError('Failed to upload cover image'))
  }

  if (!coverImage.secure_url) {
    return res.status(500).json(new ApiError('Failed to upload cover image'))
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.secure_url } },
    { new: true }
  ).select('-password')

  return res.status(201).json(new APIResponse(200, user, 'Cover image updated successfully'))
})

export const getUserChannelProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
  const username = req.params?.username

  if (!username?.trim()) {
    return res.status(400).json(new ApiError('Username is required'))
  }

  const channel = await User.aggregate([
    {
      $match: { username }
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscribedTo',
        as: 'subscribers'
      }
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo'
      }
    },
    {
      $addFields: {
        subscriberCount: { $size: '$subscribers' },
        subscribedToCount: { $size: '$subscribedTo' },
        isSubscribed: {
          $in: [req.user?._id, '$subscribers.subscriber']
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1
      }
    }
  ])

  if (!channel) {
    return res.status(404).json(new ApiError('Channel does not exist'))
  }

  return res.status(200).json(new APIResponse(200, channel[0], 'Channel found successfully'))
})

export const getUserHistory = asyncHandler(async (req: CustomRequest, res: Response) => {
  const history = await User.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(req.params?.username)
      }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: '$owner' }
      }
    }
  ])

  return res
    .status(200)
    .json(new APIResponse(200, history[0].watchHistory, 'User history fetched successfully'))
})

