import { Router } from 'express'

import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserHistory
} from '../controllers/user.controller'
import upload from '../middlewares/multer.middleware'
import verifyToken from '../middlewares/auth.middleware'

const router = Router()

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  registerUser
)
router.route('/login').post(loginUser)
router.route('/refresh-token').post(refreshAccessToken)
// Secure routes
router.route('/logout').post(verifyToken, logOutUser)
router.route('/update-password').post(verifyToken, updatePassword)
router.route('/me').get(verifyToken, getCurrentUser)
router.route('/update-account').put(verifyToken, updateAccountDetails)
router.route('/update-avatar').patch(verifyToken, upload.single('avatar'), updateAvatar)
router
  .route('/update-cover-image')
  .patch(verifyToken, upload.single('coverImage'), updateCoverImage)
router.route('/channel/:username').get(verifyToken, getUserChannelProfile)
router.route('/history/:username').get(verifyToken, getUserHistory)

export default router
