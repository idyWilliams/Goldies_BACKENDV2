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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDefaultBillingInfo = exports.deleteBillingInfo = exports.updateBillingInfo = exports.getUser = exports.saveBillingInfo = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.id;
    try {
        const isUser = yield User_model_1.default.findOne({ _id: user });
        if (!isUser) {
            return res.sendStatus(401);
        }
        // Convert the Mongoose document to a plain object
        const userObject = isUser.toObject();
        // Destructure to remove the password
        const { password } = userObject, rest = __rest(userObject, ["password"]);
        return res.json({
            user: rest,
            message: "This is from the backend just now",
        });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.getUser = getUser;
const saveBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
    const user = req.id;
    if (!firstName || !lastName || !email || !country || !cityOrTown || !streetAddress || !phoneNumber) {
        return res.status(400).json({
            error: true,
            message: "All billing information fields are required."
        });
    }
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        // If the new billing info is marked as default, set all others to false
        if (defaultBillingInfo) {
            userDetails.billingInfo.forEach(info => {
                info.defaultBillingInfo = false;
            });
        }
        // Add new billing info
        userDetails.billingInfo.push({
            firstName,
            lastName,
            email,
            country,
            cityOrTown,
            streetAddress,
            phoneNumber,
            defaultBillingInfo: defaultBillingInfo || false, // Set default if not provided
        });
        // Save user with the updated billing info
        yield userDetails.save();
        const userObject = userDetails.toObject();
        const { password } = userObject, rest = __rest(userObject, ["password"]);
        return res.status(200).json({
            error: false,
            user: rest,
            message: "Billing info saved successfully."
        });
    }
    catch (error) {
        console.error("Error saving billing info:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.saveBillingInfo = saveBillingInfo;
const updateBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
    const { billingId } = req.params;
    const user = req.id;
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again.",
            });
        }
        // Ensure billingInfo is initialized as an array
        if (!userDetails.billingInfo) {
            return res.status(400).json({
                error: true,
                message: "Billing information is not available.",
            });
        }
        // Find the billing info to be updated
        const billingDoc = userDetails.billingInfo.find((info) => { var _a; return ((_a = info._id) === null || _a === void 0 ? void 0 : _a.toString()) === billingId; });
        if (!billingDoc) {
            return res.status(404).json({
                error: true,
                message: "Billing information not found.",
            });
        }
        // If updating to default, set all other defaultBillingInfo to false
        if (defaultBillingInfo) {
            userDetails.billingInfo.forEach((info) => {
                var _a;
                if (((_a = info._id) === null || _a === void 0 ? void 0 : _a.toString()) !== billingId) {
                    info.defaultBillingInfo = false;
                }
            });
        }
        // Update the specific billing info
        if (billingDoc) {
            billingDoc.firstName = firstName;
            billingDoc.lastName = lastName;
            billingDoc.email = email;
            billingDoc.country = country;
            billingDoc.cityOrTown = cityOrTown;
            billingDoc.streetAddress = streetAddress;
            billingDoc.phoneNumber = phoneNumber;
            billingDoc.defaultBillingInfo = defaultBillingInfo || billingDoc.defaultBillingInfo;
        }
        // Save updated user details
        yield userDetails.save();
        return res.status(200).json({
            error: false,
            user: userDetails.toObject(),
            message: "Billing info updated successfully.",
        });
    }
    catch (error) {
        console.error("Error updating billing info:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again",
        });
    }
});
exports.updateBillingInfo = updateBillingInfo;
const deleteBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { billingId } = req.params;
    const user = req.id;
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again.",
            });
        }
        // Ensure billingInfo is initialized as an array
        if (!userDetails.billingInfo || !Array.isArray(userDetails.billingInfo)) {
            return res.status(400).json({
                error: true,
                message: "Billing information is not available.",
            });
        }
        // Find the index of the billing info to be removed
        const billingIndex = userDetails.billingInfo.findIndex((info) => { var _a; return ((_a = info._id) === null || _a === void 0 ? void 0 : _a.toString()) === billingId; });
        if (billingIndex === -1) {
            return res.status(404).json({
                error: true,
                message: "Billing information not found.",
            });
        }
        // Remove the billing info from the array
        userDetails.billingInfo.splice(billingIndex, 1);
        yield userDetails.save();
        return res.status(200).json({
            error: false,
            message: "Billing info deleted successfully.",
        });
    }
    catch (error) {
        console.error("Error deleting billing info:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again",
        });
    }
});
exports.deleteBillingInfo = deleteBillingInfo;
const updateDefaultBillingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { billingId } = req.params;
    const user = req.id;
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again.",
            });
        }
        // Ensure billingInfo is initialized
        if (!userDetails.billingInfo) {
            return res.status(400).json({
                error: true,
                message: "Billing information is not available.",
            });
        }
        // Update billingInfo entries
        userDetails.billingInfo.forEach((info) => {
            var _a;
            if (((_a = info._id) === null || _a === void 0 ? void 0 : _a.toString()) === billingId) {
                info.defaultBillingInfo = true;
            }
            else {
                info.defaultBillingInfo = false;
            }
        });
        // Save updated user details
        yield userDetails.save();
        return res.status(200).json({
            error: false,
            message: "Default billing info updated successfully.",
        });
    }
    catch (error) {
        console.error("Error updating default billing info:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again",
        });
    }
});
exports.updateDefaultBillingInfo = updateDefaultBillingInfo;
