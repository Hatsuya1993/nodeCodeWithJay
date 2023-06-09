import express, {Request, Response, NextFunction} from 'express'
import { EditVendorInputs, VendorLoginInputs } from '../dto'
import { FindVendor } from './AdminController'
import { GenerateSignature, ValidatePassword } from '../utility'
import { CreateFoodInputs } from '../dto/Food.dto'
import { Food } from '../models'

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const {email, password} = <VendorLoginInputs>req.body

    const existingVendor = await FindVendor('', email)

    if(existingVendor != null) {

        // Perform validation
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt)

        if(validation) {
            const signature = GenerateSignature({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })
            return res.json(signature)
        } else {
            return res.json({"Message": "Password is not valid"})
        }

    }

    return res.json({"Message": "Login credentials not valid"})

}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user
    
    if(user){
        const existingUser = await FindVendor(user._id)
        return res.json(existingUser)
    }

    return res.json({"Message": "Vendor information not found"})
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const {address, foodTypes, name, phone} = <EditVendorInputs>req.body
    const user = req.user
    
    if(user){
        const existingVendor = await FindVendor(user._id)
        if(existingVendor != null) {
            existingVendor.name = name
            existingVendor.phone = phone
            existingVendor.foodType = foodTypes
            existingVendor.address = address

            const save = await existingVendor.save()
            return res.json(save)
        }
        return res.json(existingVendor)
    }

    return res.json({"Message": "Vendor information not found"})
}

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if(user) {

        const vendor = await FindVendor(user._id)

        if(vendor) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)

            vendor.coverImage.push(...images)

            const result = await vendor.save()

            return res.json(result)
        }

    }
    return res.json({"Message": "Vendor information not found"})
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    
    if(user){
        const existingVendor = await FindVendor(user._id)
        if(existingVendor != null) {
            existingVendor.serviceAvailability = !existingVendor.serviceAvailability
            const savedResult = await existingVendor.save()
            res.json(savedResult)
        }
        return res.json(existingVendor)
    }

    return res.json({"Message": "Vendor information not found"})
}

export const CreateFood = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if(user) {

        const {category, description, foodType, name, price, readyTime} = <CreateFoodInputs>req.body
        const vendor = await FindVendor(user._id)

        if(vendor) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)

            const createFood = await Food.create({
                vendorId: vendor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                readyTime: readyTime,
                price: price,
                rating: 0,
                images: images,
            })

            vendor.foods.push(createFood)

            const result = await vendor.save()

            return res.json(result)
        }

    }
    return res.json({"Message": "Vendor information not found"})
}

export const GetAllFood = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (user) {
        const foods = await Food.find({vendorId: user._id})

        if(foods != null) {
            return res.json(foods)
        }
    }

    return res.json({"Message": "Something went wrong with get all food"})
}