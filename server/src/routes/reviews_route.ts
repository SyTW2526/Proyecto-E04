import express from 'express'
import mongoose from 'mongoose';
import { Review } from '../items/review.js' 

/**
 * Router de reviews.
 */
export const recipeRouter = express.Router();

const port = process.env.PORT || 3000

recipeRouter.use(express.json());

/**
 * Manejador POST de /reviews. Permite almacenar el documento de una receta.
 */
recipeRouter.post('/reviews', async (req, res) => {
  const review = new Review(req.body);

  try {
    await review.save();
    res.status(201).send(review);
  } catch (err) {
    res.status(400).send(err);
  }
}); 

/**
 * Manejador GET de /reviews. Permite obtener la información de una serie de recetas por cualquiera de sus campos recibidos como query string.
 */
recipeRouter.get('/reviews', async (req, res) => {
  const { userId, recipeId, creationDate } = req.query;

  const filter: any = {};
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (recipeId) {
    if (mongoose.Types.ObjectId.isValid(recipeId as string)) {
      filter.recipeId = recipeId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }

    if (creationDate) {
        const date = new Date(creationDate as string);
        if (!isNaN(date.getTime())) {
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            filter.creacionDate = { $gte: date, $lt: nextDate };
        } else {
            return res.status(400).send({ error: 'Fecha de creación no válida.' });
        }
  }

  try {
    const recipes = await Review.find(filter);

    if (recipes.length > 0) {
      res.status(200).send(recipes);
    } else {
      res.status(404).send({ error: 'Reseña no encontrada.' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador GET de /reviews. Permite obtener la información de una receta a partir de su ID único pasado como parámetro dinámico.
 */
recipeRouter.get('/reviews/:id', async (req, res) => {
  try {
    const reviews = await Review.findById(req.params.id);
      if (reviews) {
        res.send(reviews);
      } else {
        res.status(404).send({ error: 'Reseña no encontrada.' });
      }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador PATCH de /reviews. Permite actualizar la información de una receta a partir de la query string de cualquiera de sus campos.
 */
recipeRouter.patch('/reviews', async (req, res) => {
  const { userId, recipeId } = req.query;

  const filter: any = {};
  if (!recipeId && !userId) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (name, category o userId) en la query string para identificar la(s) receta(s) a modificar.',
    });
  }
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (recipeId) {
    if (mongoose.Types.ObjectId.isValid(recipeId as string)) {
      filter.recipeId = recipeId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      error: 'Los campos a modificar tienen que proporcionarse en el cuerpo de la solicitud (req.body).',
    });
  }

  const allowedUpdates = ['rating', 'text'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'La actualización contiene campos no permitidos o inválidos.',
    });
  } 

  try {
    const reviews = await Review.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!reviews) {
      return res.status(404).send({ error: 'Reseña(s) no encontrada(s) con el filtro proporcionado.' });
    }

    res.status(200).send(reviews);
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Manejador PATCH de /reviews. Permite actualizar la información de una receta mediante su ID pasado como parámetro dinámico.
 */
recipeRouter.patch('/reviews/:id', async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  } else {
    const allowedUpdates = ['rating', 'text'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      try {
        const reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!reviews) {
          res.status(404).send();
        } else {
          res.send(reviews);
        }
      } catch (err) {
        res.status(400).send(err);
      }
    }
  }
});

/**
 * Manejador DELETE de /reviews. Permite borrar una receta según cualquiera de sus campos.
 */
recipeRouter.delete('/reviews', async (req, res) => {
  const { recipeId, userId, creationDate } = req.query;

  const filter: any = {};
  if (!recipeId && !userId) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (recipeId o userId) en la query string para identificar la receta a borrar.',
    });
  }

  if (recipeId) {
    if (mongoose.Types.ObjectId.isValid(recipeId as string)) {
      filter.recipeId = recipeId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (creationDate) {
        const date = new Date(creationDate as string);
        if (!isNaN(date.getTime())) {
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            filter.creacionDate = { $gte: date, $lt: nextDate };
        } else {
            return res.status(400).send({ error: 'Fecha de creación no válida.' });
        }
  }

  try {
    const reviews = await Review.findOneAndDelete(filter);
    if (!reviews) {
      return res.status(404).send({ error: 'Receta no encontrada con el filtro proporcionado.' });
    }
    res.status(200).send(reviews);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador DELETE de /reviews. Permite borrar una receta según su ID pasado como un parámetro dinámico.
 */
recipeRouter.delete('/reviews/:id', async (req, res) => {
  try {
    const reviews = await Review.findByIdAndDelete(req.params.id);

    if (!reviews) {
      res.status(404).send();
    } else {
      res.send(reviews);
    }
  } catch (err) {
    res.status(500).send();
  }
});