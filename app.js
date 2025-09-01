import express from "express";
import dotenv from "dotenv";
import companyRoutes from "./src/routes/companyRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());


app.use("/server", companyRoutes);  
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 API is running on http://localhost:${port}`);
});