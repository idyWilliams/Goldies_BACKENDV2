import { Router } from "express"
import { contactUs, newsLetterSubscription } from "../controllers/mailController"
const router = Router()

router.post("/newsletter_subscriptions", newsLetterSubscription)
router.post("/contact_us", contactUs)

export default router