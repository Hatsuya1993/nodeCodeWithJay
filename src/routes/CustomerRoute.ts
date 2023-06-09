import express from 'express'
import { CustomerEditProfile, CustomerLogin, CustomerOtp, CustomerProfile, CustomerSignup, CustomerVerify } from '../controllers'
import { Authenticate } from '../middlewares'

const router = express.Router()

router.post('/signup', CustomerSignup)

router.post('/login', CustomerLogin)

router.use(Authenticate)

router.patch('/verify', CustomerVerify)

router.get('/otp', CustomerOtp)

router.get('/profile', CustomerProfile)

router.patch('/profile', CustomerEditProfile)

export {router as CustomerRoute}