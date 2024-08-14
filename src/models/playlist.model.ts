import { Schema, model, Model } from 'mongoose'

import { IPlaylist } from '../types/custom.types'

const playlistSchema = new Schema<IPlaylist>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
)

const Playlist: Model<IPlaylist> = model('Playlist', playlistSchema)
export default Playlist
