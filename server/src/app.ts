import dotenv from "dotenv";
import path from "path";

// cargar variables desde server/config/dev.env
dotenv.config({
  path: path.join(__dirname, "..", "config", "dev.env")
});

console.log("MongoDB URL:", process.env.MONGODB_URL);

// AHORA importamos mongoose (ya existen las env)
import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user_route";
import { connectDB } from "./config/db/mongoose";

connectDB();




const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir imágenes estáticas
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rutas
app.use("/api", userRouter);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
