"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const categoryController_1 = require("../controllers/categoryController");
const verifyJWT_1 = require("../middleware/verifyJWT");
router.post("/create_category", verifyJWT_1.authenticateToken, categoryController_1.createCategory);
router.get("/get_all_category", categoryController_1.getAllCategories);
router.get("/get_category/:categoryId", categoryController_1.getCategory);
router.put("/edit_category/:categoryId", verifyJWT_1.authenticateToken, categoryController_1.editCategory);
router.delete("/delete_category/:categoryId", verifyJWT_1.authenticateToken, categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoute.js.map