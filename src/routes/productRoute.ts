import { Router } from "express";
const router = Router();
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProduct,
  getProductBySlug,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_product", authenticateToken, createProduct);
router.get("/get_all_product", getAllProducts);
router.get("/get_product/:productId", getProduct);
router.put("/edit_product/:productId", authenticateToken, editProduct);
router.delete("/delete_product/:productId", authenticateToken, deleteProduct);
router.get("/slug/:slug", getProductBySlug);

export default router;
