import express from "express";
import { getFinancialsBySymbol } from "../controllers/companyController.js";

const router = express.Router();

router.get("/company/:symbol", getFinancialsBySymbol);

export default router;
