import { Router } from 'express'

import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken
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
// secured routes
router.route('/logout').post(verifyToken, logOutUser)
router.route('/refresh-token').post(refreshAccessToken)

export default router
