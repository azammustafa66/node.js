import { Schema, model, Model } from 'mongoose'

import { ITweet } from '../types/custom.types'

const tweetSchema = new Schema<ITweet>(
  {
    text: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

const Tweet: Model<ITweet> = model('Tweet', tweetSchema)
export default Tweet
