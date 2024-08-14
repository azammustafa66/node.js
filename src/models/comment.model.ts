import { Schema, model, Model } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import { IComment } from '../types/custom.types'

const commentSchema = new Schema<IComment>(
  {
    text: {
      type: String,
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate)

const Comment: Model<IComment> = model('Comment', commentSchema)
export default Comment
