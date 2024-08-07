import { Router } from "express";
const router = Router();
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProduct,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_product", authenticateToken, createProduct);
router.get("/get_all_product", authenticateToken, getAllProducts);
router.get("/get_product/:productId", authenticateToken, getProduct);
router.put("/edit_product/:productId", authenticateToken, editProduct);
router.delete("/delete_product/:productId", authenticateToken, deleteProduct);

export default router;
