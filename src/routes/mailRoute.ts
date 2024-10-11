import { Router } from "express"
import { newsLetterSubscription } from "../controllers/mailController"
const router = Router()

router.post("/newsletter_subscriptions", newsLetterSubscription)

export default router