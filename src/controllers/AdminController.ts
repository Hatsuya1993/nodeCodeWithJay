import express, {Request, Response, NextFunction} from 'express'
import { CreateVendorInput } from '../dto'
import { Vendor } from '../models'
import { GeneratePassword, GenerateSalt } from '../utility'

export const FindVendor = async (id: string | undefined, email?: string) => {
    if(email){
        return await Vendor.findOne({email})
    }
    else{
        return await Vendor.findById(id)
    }
}

export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {

    const {name, address, email, foodType, ownerName, password, phone, pincode} = <CreateVendorInput>req.body

    const existingVendor = await FindVendor('', email)

    // Generate the salt 

    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt)

    // Encrpyt the password using the salt

    if(existingVendor != null){
        return res.json({
            'Message':  "User email exist"
        })
    }

    const createVendor = await Vendor.create({
        name: name,
        ownerName: ownerName,
        foodType: foodType,
        pincode: pincode,
        address: address,
        phone: phone,
        email: email,
        password: userPassword,
        salt: salt,
        rating: 0,
        serviceAvailability: false,
        coverImage: []
    })


    
    return res.json(createVendor)
}

export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {

    const vendors = await Vendor.find()

    if(vendors != null) {
        return res.json(vendors)
    }

    return res.json({"Message": "No Vendors"})

}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {

    const vendorById = await FindVendor(req.params.id)

    if(vendorById != null) {
        return res.json({
            vendorById
        })
    }

    return res.json({"Message": "No Vendors found"})

}