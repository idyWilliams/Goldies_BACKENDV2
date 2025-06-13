"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const subCategoryController_1 = require("../controllers/subCategoryController");
const verifyJWT_1 = require("../middleware/verifyJWT");
router.post("/create_subcategory", verifyJWT_1.authenticateToken, subCategoryController_1.createSubCategory);
router.get("/get_all_subcategory", subCategoryController_1.getAllSubCategory);
router.get("/get_subcategory/:subCategoryId", subCategoryController_1.getSubCategory);
router.put("/edit_subcategory/:subCategoryId", verifyJWT_1.authenticateToken, subCategoryController_1.updateSubCategory);
router.delete("/delete_subcategory/:subCategoryId", verifyJWT_1.authenticateToken, subCategoryController_1.deleteSubCategory);
exports.default = router;
//# sourceMappingURL=subcategoryRoute.js.map