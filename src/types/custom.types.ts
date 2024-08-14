import e, { Request } from 'express'
import { Document, Types } from 'mongoose'
import { JwtPayload } from 'jsonwebtoken'

export interface IUser extends Document {
  _id: Types.ObjectId
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
  _id: string
}

export interface ISubscription extends Document {
  _id: string
  subscriber: Types.ObjectId
  subscribedTo: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IPlaylist extends Document {
  _id: string
  title: string
  description?: string
  videos: Types.ObjectId[]
  owner: Types.ObjectId
}

export interface IComment extends Document {
  text: string
  video: Types.ObjectId
  user: Types.ObjectId
}

export interface ILikes extends Document {
  _id: string
  comment: Types.ObjectId
  video: Types.ObjectId
  tweet: Types.ObjectId
  likedBy: Types.ObjectId
}

export interface ITweet extends Document {
  _id: string
  text: string
  user: Types.ObjectId
  likes: Types.ObjectId[]
}
