import { NextFunction, Request, Response } from "express";
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs, EditCustomerProfileInputs, UserLoginInput } from "../dto/Customer.dto";
import { validate } from 'class-validator'
import { GeneratePassword, GenerateSalt, GenerateOtp, onRequestOTP, GenerateSignature, ValidatePassword } from "../utility";
import { Customer } from "../models/Customer";

export const CustomerSignup = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(CreateCustomerInputs, req.body)
    const inputErrors = await validate(customerInputs, {validationError: {target: true}})
    if(inputErrors.length > 0) {
        return res.status(400).json(inputErrors)
    }
    const {email, password, phone} = customerInputs

    const salt = await GenerateSalt()

    const userPassword = await GeneratePassword(password, salt)

    const {expiry, otp} = GenerateOtp()

    const existingCustomer = await Customer.find({email: email})

    if(existingCustomer.length != 0) {
        return res.status(400).json({"Message": "Email already used"})
    }

    const result = await Customer.create({
        email: email,
        password: userPassword,
        phone: phone,
        salt: salt,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
    })

    if(result) {
        
        await onRequestOTP(otp, phone)

        const signature = await GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        
        res.status(201).json({signature: signature, verified: result.verified, email: result.email})
    }

    return res.status(400).json({"Message": "Error With Signup"})
}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const loginInputs = plainToClass(UserLoginInput, req.body)

    const inputErrors = await validate(loginInputs, {validationError: {target: true}})

    if(inputErrors.length > 0) {
        res.status(400).json(inputErrors)
    }

    const {email, password} = loginInputs

    const findUser = await Customer.findOne({email: email})

    if(findUser){
        const validation = await ValidatePassword(password, findUser.password, findUser.salt)
        if(validation) {
            const signature = await GenerateSignature({
                _id: findUser._id,
                email: findUser.email,
                verified: findUser.verified
            })
            return res.status(201).json({
                signature: signature,
                email: findUser.email,
                verified: findUser.verified
            })
        }
        return res.status(400).json({"Message": "Password incorrect"})
    }

    return res.status(400).json({"Message": "User not found"})
}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const {otp} = req.body
    const customer = req.user

    if(customer){
        const profile = await Customer.findById(customer._id)
        if(profile){
            if(profile.otp == otp && new Date() <= profile.otp_expiry){
                profile.verified = true
                const updateCustomerResponse = await profile.save()
                const signature = await GenerateSignature({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified
                })
                return res.status(200).json({signature: signature, email: updateCustomerResponse.email, verified: updateCustomerResponse.verified})
            }
        }
        return res.status(400).json({"Message": "User not found"})
    }

    return res.status(400).json({"Message": "User not authorized"})
}

export const CustomerOtp = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    if(customer) {
        const profile = await Customer.findById(customer._id)
        if(profile){
            const {expiry, otp} = GenerateOtp()
            profile.otp = otp
            profile.otp_expiry = expiry

            await profile.save()
            await onRequestOTP(otp, profile.phone)

            return res.status(200).json({"Message": "OTP sent to your phone"})
        }
        return res.status(400).json({"Message": "User not found"})
    }

    return res.status(400).json({"Message": "User not authorized"})
}

export const CustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user

    if(customer){
        const user = await Customer.findById(customer._id)
        if(user){
            return res.status(200).json(user)
        }
        return res.status(400).json({"Message": "Unable to find user"})
    }

    return res.status(400).json({"Message": "User not authorized"})
}

export const CustomerEditProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user 

    const profileInputs = plainToClass(EditCustomerProfileInputs , req.body)

    const profileErrors = await validate(profileInputs, {validationError: {target: false}})

    const {address, firstName, lastName} = profileInputs

    if(profileErrors.length > 0){
        res.status(400).json(profileErrors)
    }

    if(customer){
        const profile = await Customer.findById(customer._id)

        if (profile){
            profile.firstName = firstName
            profile.lastName = lastName
            profile.address = address

            await profile.save()
            return res.status(200).json(profile)
        }

        return res.status(400).json({"Message": "User not found"})
    }

    return res.status(400).json({"Message": "User not authenticated"})
}