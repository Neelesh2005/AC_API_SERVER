import express from "express";
import apiKeyAuth from "../../middleware/apiKeyAuth.js";
import apiLogger from "../../middleware/apiLogger.js";
import { get52WeekData,getGLData } from "../controllers/dailyController.js";
const router = express.Router();
router.use(apiKeyAuth);

router.use(apiLogger);
router.get("/52week", get52WeekData);
router.get("/GL", getGLData);
export default router;