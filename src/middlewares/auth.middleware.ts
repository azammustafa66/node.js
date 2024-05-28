import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { DecodedAccessToken, CustomRequest, IUser } from '../types/custom.types'
import User from '../models/user.model'
import asyncHandler from '../utils/asyncHandler'
import ApiError from '../utils/APIError'


const verifyToken = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ?? req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as DecodedAccessToken

    const user = await User.findById(decoded?._id).select('-password -refreshToken')

    if (!user) {
      return res.status(401).json(new ApiError('Unauthorized'))
    }

    req.user = user
    next()
  } catch (error: any) {
    return res.status(401).json(new ApiError(error.message || 'Unauthorized'))
  }
})

export default verifyToken
