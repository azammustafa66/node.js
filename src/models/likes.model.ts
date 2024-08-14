import { Schema, model, Model } from 'mongoose'

import { ILikes } from '../types/custom.types'

const likesSchema = new Schema<ILikes>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video'
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet'
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

const Likes: Model<ILikes> = model('Likes', likesSchema)
export default Likes
