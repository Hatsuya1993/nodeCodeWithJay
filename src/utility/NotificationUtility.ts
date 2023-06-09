export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000))

    return {otp, expiry}
}

export const onRequestOTP = async (otp: Number, toPhoneNumber: String) => {

    const accountSid = "AC286606bfbdf1982f7c29a279ceb6eb3a"
    const authToken = "aa6fcc282d2ed000d3b7a6d65167a5bd"

    const client = require("twilio")(accountSid, authToken)

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+13612669720',
        to: `+65${toPhoneNumber}`
    })

    return response
}