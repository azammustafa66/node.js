import { Request, Response, NextFunction } from 'express'

import asyncHandler from '../utils/asyncHandler'

const verifyToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ??
    (req.headers?.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1])

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  next()
})

export default verifyToken
