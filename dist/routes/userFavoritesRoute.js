"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const verifyJWT_1 = require("../middleware/verifyJWT");
const userFavoritesController_1 = require("../controllers/userFavoritesController");
router.post("/add", verifyJWT_1.authenticateToken, userFavoritesController_1.addFavorite);
router.delete("/remove/:productId", verifyJWT_1.authenticateToken, userFavoritesController_1.removeFavorite);
router.get("/", verifyJWT_1.authenticateToken, userFavoritesController_1.getFavorites);
exports.default = router;
//# sourceMappingURL=userFavoritesRoute.js.map