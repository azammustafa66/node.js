import { Model, Schema, model } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

import { IVideo } from '../types/custom.types'

const videoSchema = new Schema<IVideo>(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

videoSchema.plugin(mongooseAggregatePaginate)

const Video: Model<IVideo> = model<IVideo>('Video', videoSchema)
export default Video
