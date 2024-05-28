import { Request } from 'express'
import { Document, Types } from 'mongoose'
import { JwtPayload } from 'jsonwebtoken'

export interface IUser extends Document {
  _id?: Types.ObjectId
  username: string
  email: string
  fullName: string
  avatar: string
  coverImage?: string
  watchHistory: Types.ObjectId[]
  password: string
  refreshToken?: string
  comparePassword(password: string): Promise<boolean>
  generateAccessToken(): string
  generateRefreshToken(): string
}

export interface IVideo extends Document {
  _id?: Types.ObjectId
  videoFile: string
  thumbnail: string
  title: string
  description: string
  duration: number
  views: number
  isPublished: boolean
  owner: Types.ObjectId
}

export type DecodedAccessToken = JwtPayload & {
  _id: Types.ObjectId
  email: string
  username: string
  fullName: string
}

export interface CustomRequest extends Request {
  user?: DecodedAccessToken
}

export type DecodedRefreshToken = JwtPayload & {
  _id: Types.ObjectId
}
