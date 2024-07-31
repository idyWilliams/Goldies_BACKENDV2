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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = __importDefault(require("../models/User.model"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.id;
    try {
        const isUser = yield User_model_1.default.findOne({ _id: user });
        if (!isUser) {
            return res.sendStatus(401);
        }
        return res.json({
            user: {
                firstName: isUser.firstName,
                lastName: isUser.lastName,
                email: isUser.email,
                _id: isUser._id,
            },
            message: "This is from the backend just now",
        });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = getUser;
