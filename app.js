import express from "express";
import dotenv from "dotenv";
import companyRoutes from "./src/routes/companyRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import routesList from "./src/utils/routeLists.js";
import formatResponse from "./src/utils/responseFormatter.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json(formatResponse({
    status: "success",
    message: "Welcome to AC_API_SERVER 🚀",
    available_routes: routesList
  }));
});
app.use("/server", companyRoutes);  
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 API is running on http://localhost:${port}`);
});