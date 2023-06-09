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
exports.GetVendorByID = exports.GetVendors = exports.CreateVendor = exports.FindVendor = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const FindVendor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vendor.findOne({ email });
    }
    else {
        return yield models_1.Vendor.findById(id);
    }
});
exports.FindVendor = FindVendor;
const CreateVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, email, foodType, ownerName, password, phone, pincode } = req.body;
    const existingVendor = yield (0, exports.FindVendor)('', email);
    // Generate the salt 
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    // Encrpyt the password using the salt
    if (existingVendor != null) {
        return res.json({
            'Message': "User email exist"
        });
    }
    const createVendor = yield models_1.Vendor.create({
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
    });
    return res.json(createVendor);
});
exports.CreateVendor = CreateVendor;
const GetVendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendors = yield models_1.Vendor.find();
    if (vendors != null) {
        return res.json(vendors);
    }
    return res.json({ "Message": "No Vendors" });
});
exports.GetVendors = GetVendors;
const GetVendorByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorById = yield (0, exports.FindVendor)(req.params.id);
    if (vendorById != null) {
        return res.json({
            vendorById
        });
    }
    return res.json({ "Message": "No Vendors found" });
});
exports.GetVendorByID = GetVendorByID;
//# sourceMappingURL=AdminController.js.map