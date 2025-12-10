import express from 'express';
import { mongoConnectionPromise } from './db/mongoose.js'; 
import { userRouter } from './routes/user_route.js';
import { recipeRouter } from './routes/recipes-route.js';
import cors from "cors";
import { reviewRouter } from './routes/reviews_route.js';
import { seedDefaultRecipes } from './db/seedRecipes.js';

export const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://10.6.129.124:5173"],
  methods: "GET,POST,PATCH,DELETE",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/default", express.static("default"));
app.use(userRouter);
app.use(recipeRouter);
app.use(reviewRouter);

const port = process.env.PORT || 3000;

const startServer = async () => {
	try {
		await mongoConnectionPromise; 
		if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_SEED === 'true') {
			await seedDefaultRecipes(); 
		}
		app.listen(port, () => {
			console.log(`Server is up on port ${port}`);
		});
	} catch (error) {
		console.error("La aplicación no pudo iniciar debido a un error de DB/Semilla.");
		process.exit(1); 
	}
}

/**
 * Si un usuario intenta utilzar un servicio no implementado, se le envía un código de error.
 */
app.all('/{*splat}', (_, res) => {
  res.status(501).send();
});

startServer();