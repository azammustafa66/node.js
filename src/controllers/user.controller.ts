import { Request, Response } from 'express'
import 'dotenv/config'

import User from '../models/user.model'
import { IUser } from '../types/models.interface'
import ApiError from '../utils/APIError'
import asyncHandler from '../utils/asyncHandler'
import uploadToCloudinary from '../utils/cloudinary'
import APIResponse from '../utils/APIResponse'
import { httpOptions } from '../utils/constants'

const generateTokens = async (user: IUser) => {
  try {
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if (!accessToken || !refreshToken) {
      throw new ApiError('Failed to generate tokens')
    }

    await user.save({ validateBeforeSave: false })
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
  // 1. Validate request body
  // 2. Check if user exists
  // 3. Compare password
  // 4. Generate access and refresh tokens, then save refresh token to DB and to user's header

  const { email, username, password } = req.body

  if (!email || !username) {
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

  return res
    .status(200)
    .header('Content-Security-Policy', "default-src 'self'")
    .header('X-Frame-Options', 'DENY')
    .header('X-XSS-Protection', '1; mode=block')
    .json(
      new APIResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged in successfully'
      )
    )
})

export const logOutUser = asyncHandler(async (req: Request, res: Response) => {
  // 1. Clear user's cookie
  // 2. Remove refresh token from DB
  // 3. Send response
  // 4. Redirect to login page

  const user = req
})
