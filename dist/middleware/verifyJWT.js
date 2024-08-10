"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return res.sendStatus(401);
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err)
            return res.sendStatus(403);
        req.id = decoded.id;
        next();
    });
};
exports.authenticateToken = authenticateToken;
