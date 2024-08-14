import { Router } from 'express'

import { getChannelStats, getAllVideosUploadedByChannel } from '../controllers/dashboard.controller'
import verifyToken from '../middlewares/auth.middleware'

const router = Router()

router.route('/channel/stats/:id').get(verifyToken, getChannelStats)
router.route('/channel/videos/:id').get(verifyToken, getAllVideosUploadedByChannel)

export default router
