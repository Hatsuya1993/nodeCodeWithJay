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
exports.GetAllFood = exports.CreateFood = exports.UpdateVendorService = exports.UpdateVendorCoverImage = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VendorLogin = void 0;
const AdminController_1 = require("./AdminController");
const utility_1 = require("../utility");
const models_1 = require("../models");
const VendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVendor = yield (0, AdminController_1.FindVendor)('', email);
    if (existingVendor != null) {
        // Perform validation
        const validation = yield (0, utility_1.ValidatePassword)(password, existingVendor.password, existingVendor.salt);
        if (validation) {
            const signature = (0, utility_1.GenerateSignature)({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            });
            return res.json(signature);
        }
        else {
            return res.json({ "Message": "Password is not valid" });
        }
    }
    return res.json({ "Message": "Login credentials not valid" });
});
exports.VendorLogin = VendorLogin;
const GetVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingUser = yield (0, AdminController_1.FindVendor)(user._id);
        return res.json(existingUser);
    }
    return res.json({ "Message": "Vendor information not found" });
});
exports.GetVendorProfile = GetVendorProfile;
const UpdateVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, foodTypes, name, phone } = req.body;
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
        if (existingVendor != null) {
            existingVendor.name = name;
            existingVendor.phone = phone;
            existingVendor.foodType = foodTypes;
            existingVendor.address = address;
            const save = yield existingVendor.save();
            return res.json(save);
        }
        return res.json(existingVendor);
    }
    return res.json({ "Message": "Vendor information not found" });
});
exports.UpdateVendorProfile = UpdateVendorProfile;
const UpdateVendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vendor = yield (0, AdminController_1.FindVendor)(user._id);
        if (vendor) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vendor.coverImage.push(...images);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ "Message": "Vendor information not found" });
});
exports.UpdateVendorCoverImage = UpdateVendorCoverImage;
const UpdateVendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.FindVendor)(user._id);
        if (existingVendor != null) {
            existingVendor.serviceAvailability = !existingVendor.serviceAvailability;
            const savedResult = yield existingVendor.save();
            res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ "Message": "Vendor information not found" });
});
exports.UpdateVendorService = UpdateVendorService;
const CreateFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { category, description, foodType, name, price, readyTime } = req.body;
        const vendor = yield (0, AdminController_1.FindVendor)(user._id);
        if (vendor) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            const createFood = yield models_1.Food.create({
                vendorId: vendor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                readyTime: readyTime,
                price: price,
                rating: 0,
                images: images,
            });
            vendor.foods.push(createFood);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ "Message": "Vendor information not found" });
});
exports.CreateFood = CreateFood;
const GetAllFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const foods = yield models_1.Food.find({ vendorId: user._id });
        if (foods != null) {
            return res.json(foods);
        }
    }
    return res.json({ "Message": "Something went wrong with get all food" });
});
exports.GetAllFood = GetAllFood;
//# sourceMappingURL=VendorController.js.map