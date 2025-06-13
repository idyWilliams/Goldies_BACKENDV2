"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const productController_1 = require("../controllers/productController");
const verifyJWT_1 = require("../middleware/verifyJWT");
router.post("/create_product", verifyJWT_1.authenticateToken, productController_1.createProduct);
router.get("/get_all_product", productController_1.getAllProducts);
router.get("/get_product/:productId", productController_1.getProduct);
router.put("/edit_product/:productId", verifyJWT_1.authenticateToken, productController_1.editProduct);
router.delete("/delete_product/:productId", verifyJWT_1.authenticateToken, productController_1.deleteProduct);
router.get("/slug/:slug", productController_1.getProductBySlug);
exports.default = router;
//# sourceMappingURL=productRoute.js.map