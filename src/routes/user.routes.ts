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
router.route('/logout').post(verifyToken, logOutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/update-password').post(verifyToken, updatePassword)
router.route('/me').get(verifyToken, getCurrentUser)
router.route('/update-account').put(verifyToken, updateAccountDetails)
router.route('/update-avatar').put(verifyToken, upload.single('avatar'), updateAvatar)
router.route('/update-cover-image').put(verifyToken, upload.single('coverImage'), updateCoverImage)
router.route('/channel/:username').get(getUserChannelProfile)
router.route('/history/:username').get(getUserHistory)

export default router
