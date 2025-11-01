import express from 'express';
import './db/mongoose.js';
import { userRouter } from './routes/user_route.js';
import { recipeRouter } from './routes/recipes-route.js';

export const app = express();

app.use(express.json());
app.use(userRouter);
app.use(recipeRouter);

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