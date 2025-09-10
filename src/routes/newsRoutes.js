import express from "express";
import apiKeyAuth from "../../middleware/apiKeyAuth.js";
import apiLogger from "../../middleware/apiLogger.js";
const router = express.Router();
router.use(apiKeyAuth);

router.use(apiLogger);
import { getNewsByTicker } from "../controllers/newsController.js";
// Get news by ticker
router.get("/:ticker", getNewsByTicker);
export default router;