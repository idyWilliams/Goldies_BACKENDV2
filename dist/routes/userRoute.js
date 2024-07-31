"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = require("../middleware/verifyJWT");
const userController_1 = __importDefault(require("../controllers/userController"));
const router = (0, express_1.Router)();
router.get("/get_user", verifyJWT_1.authenticateToken, userController_1.default);
exports.default = router;
