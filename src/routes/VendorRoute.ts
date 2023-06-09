import express, {Request, Response, NextFunction} from 'express'
import { CreateFood, GetAllFood, GetVendorProfile, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from '../controllers'
import { Authenticate } from '../middlewares'
import multer from 'multer'
import path from 'path'

const router = express.Router()

const imageStorage = multer.diskStorage({
    destination: './images',

    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const images = multer({storage: imageStorage}).array('images', 10)

router.post('/login', VendorLogin)


router.use(Authenticate)
router.get('/profile' ,GetVendorProfile)
router.patch('/profile', UpdateVendorProfile)
router.patch('/coverimage', images, UpdateVendorCoverImage)
router.patch('/service', UpdateVendorService)

router.post('/food', images, CreateFood)
router.get('/foods', GetAllFood)

router.get('/', (req: Request, res: Response) => {
    res.json({message: "Hello from vendor"})
})

export {router as VendorRoute}