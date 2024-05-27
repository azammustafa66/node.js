import { Document, Types } from 'mongoose'

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
