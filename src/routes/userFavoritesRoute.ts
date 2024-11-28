import { Router } from "express";
const router = Router();
import { authenticateToken } from "../middleware/verifyJWT";
import { addFavorite, getFavorites, removeFavorite } from "../controllers/userFavoritesController";

router.post("/add", authenticateToken, addFavorite);
router.delete("/remove/:productId", authenticateToken, removeFavorite);
router.get("/", authenticateToken, getFavorites);


export default router;
