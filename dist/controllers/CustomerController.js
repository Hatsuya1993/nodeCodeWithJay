"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEditProfile = exports.CustomerProfile = exports.CustomerOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignup = void 0;
const class_transformer_1 = require("class-transformer");
const Customer_dto_1 = require("../dto/Customer.dto");
const class_validator_1 = require("class-validator");
const utility_1 = require("../utility");
const Customer_1 = require("../models/Customer");
const CustomerSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, password, phone } = customerInputs;
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const { expiry, otp } = (0, utility_1.GenerateOtp)();
    const existingCustomer = yield Customer_1.Customer.find({ email: email });
    if (existingCustomer.length != 0) {
        return res.status(400).json({ "Message": "Email already used" });
    }
    const result = yield Customer_1.Customer.create({
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
    });
    if (result) {
        yield (0, utility_1.onRequestOTP)(otp, phone);
        const signature = yield (0, utility_1.GenerateSignature)({
            _id: result._id,
            email: result.email,
            verified: result.verified
        });
        res.status(201).json({ signature: signature, verified: result.verified, email: result.email });
    }
    return res.status(400).json({ "Message": "Error With Signup" });
});
exports.CustomerSignup = CustomerSignup;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.UserLoginInput, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(loginInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        res.status(400).json(inputErrors);
    }
    const { email, password } = loginInputs;
    const findUser = yield Customer_1.Customer.findOne({ email: email });
    if (findUser) {
        const validation = yield (0, utility_1.ValidatePassword)(password, findUser.password, findUser.salt);
        if (validation) {
            const signature = yield (0, utility_1.GenerateSignature)({
                _id: findUser._id,
                email: findUser.email,
                verified: findUser.verified
            });
            return res.status(201).json({
                signature: signature,
                email: findUser.email,
                verified: findUser.verified
            });
        }
        return res.status(400).json({ "Message": "Password incorrect" });
    }
    return res.status(400).json({ "Message": "User not found" });
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            if (profile.otp == otp && new Date() <= profile.otp_expiry) {
                profile.verified = true;
                const updateCustomerResponse = yield profile.save();
                const signature = yield (0, utility_1.GenerateSignature)({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified
                });
                return res.status(200).json({ signature: signature, email: updateCustomerResponse.email, verified: updateCustomerResponse.verified });
            }
        }
        return res.status(400).json({ "Message": "User not found" });
    }
    return res.status(400).json({ "Message": "User not authorized" });
});
exports.CustomerVerify = CustomerVerify;
const CustomerOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            const { expiry, otp } = (0, utility_1.GenerateOtp)();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            yield profile.save();
            yield (0, utility_1.onRequestOTP)(otp, profile.phone);
            return res.status(200).json({ "Message": "OTP sent to your phone" });
        }
        return res.status(400).json({ "Message": "User not found" });
    }
    return res.status(400).json({ "Message": "User not authorized" });
});
exports.CustomerOtp = CustomerOtp;
const CustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const user = yield Customer_1.Customer.findById(customer._id);
        if (user) {
            return res.status(200).json(user);
        }
        return res.status(400).json({ "Message": "Unable to find user" });
    }
    return res.status(400).json({ "Message": "User not authorized" });
});
exports.CustomerProfile = CustomerProfile;
const CustomerEditProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInputs, req.body);
    const profileErrors = yield (0, class_validator_1.validate)(profileInputs, { validationError: { target: false } });
    const { address, firstName, lastName } = profileInputs;
    if (profileErrors.length > 0) {
        res.status(400).json(profileErrors);
    }
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            yield profile.save();
            return res.status(200).json(profile);
        }
        return res.status(400).json({ "Message": "User not found" });
    }
    return res.status(400).json({ "Message": "User not authenticated" });
});
exports.CustomerEditProfile = CustomerEditProfile;
//# sourceMappingURL=CustomerController.js.map