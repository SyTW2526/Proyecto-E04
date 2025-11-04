import express from 'express';
import './db/mongoose.js';

const app = express();

app.use(express.json());

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