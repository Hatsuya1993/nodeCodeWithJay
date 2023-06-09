import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { AuthPayload, VendorPayload } from '../dto'
import { APP_SECRET } from '../config'
import { Request } from 'express'

export const GenerateSalt = async () => {
    return bcrypt.genSalt()
}

export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt)
}

export const ValidatePassword = async (entereredPassword: string, savedPassword: string, salt: string) => {
    return await GeneratePassword(entereredPassword, salt) === savedPassword
}

export const GenerateSignature = async (payload: AuthPayload) => {
    const signature = jwt.sign(payload, APP_SECRET, { expiresIn: '1h' })
    return signature
}

export const ValidateSignature = async (req: Request) => {
    const signature = req.get('Authorization')

    if(signature){
        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload
        
        req.user = payload
        
        return true
    }

    return false
}