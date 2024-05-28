import { Schema, model, Model } from 'mongoose'

import { ISubscription } from '../types/custom.types'

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    subscribedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

const Subscription: Model<ISubscription> = model('Subscription', subscriptionSchema)
export default Subscription
