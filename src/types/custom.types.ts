import e, { Request } from 'express'
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
  user?: {
    _id: Types.ObjectId
    email: string
    username: string
    fullName: string
    avatar: string
    coverImage?: string
    watchHistory: Types.ObjectId[]
  }
}

export type DecodedRefreshToken = JwtPayload & {
  _id: Types.ObjectId
}

export interface ISubscription extends Document {
  subscriber: Types.ObjectId
  subscribedTo: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}
