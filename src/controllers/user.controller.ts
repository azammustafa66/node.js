import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
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
        secure: process.env.NODE_ENV === 'production'
      })
      res.clearCookie('accessToken', {
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production'
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
