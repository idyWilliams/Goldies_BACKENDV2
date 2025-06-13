"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticateToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Require authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return res.sendStatus(401);
    const token1 = authHeader.split(" ")[1];
    const { token: token2 } = req.body;
    let token = token1 ? token1 : token2;
    if (!token1 && !token2)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            console.error("Token verification error:", err);
            return res.sendStatus(403);
        }
        req.id = decoded.id;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Optional authentication - request proceeds even without auth
const optionalAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        // No authentication provided, but that's OK
        next();
        return;
    }
    const token1 = authHeader.split(" ")[1];
    const { token: token2 } = req.body;
    let token = token1 ? token1 : token2;
    if (!token1 && !token2) {
        // No token found, but that's OK
        next();
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            // Invalid token, but we still proceed
            console.error("Token verification error:", err);
            next();
            return;
        }
        // Valid token, set the user ID
        req.id = decoded.id;
        next();
    });
};
exports.optionalAuthenticateToken = optionalAuthenticateToken;
//# sourceMappingURL=verifyJWT.js.map