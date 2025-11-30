import express from 'express';
import './db/mongoose.js';
import { userRouter } from './routes/user_route.js';
import { recipeRouter } from './routes/recipes-route.js';
import cors from "cors";
import { reviewRouter } from './routes/reviews_route.js';

export const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  optionsSuccessStatus: 204
}));

app.use(userRouter);
app.use(recipeRouter);
app.use(reviewRouter);

const port = process.env.PORT || 3000;

/**
 * Si un usuario intenta utilzar un servicio no implementado, se le envía un código de error.
 */
app.all('/{*splat}', (_, res) => {
  res.status(501).send();
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});