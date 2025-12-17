import express from 'express'
import mongoose from 'mongoose';
import { Review } from '../items/review.js' 
import { Recipe } from '../items/recipe.js';
import { User } from '../items/user.js';

/**
 * Router de reviews.
 */
export const reviewRouter = express.Router();

const port = process.env.PORT || 3000

reviewRouter.use(express.json());

/**
 * Manejador POST de /reviews. Permite almacenar el documento de una receta.
 */
reviewRouter.post('/reviews', async (req, res) => {
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
reviewRouter.get('/reviews', async (req, res) => {
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
            filter.creationDate = { $gte: date, $lt: nextDate };
        } else {
            return res.status(400).send({ error: 'Fecha de creación no válida.' });
        }
  }

  try {
    const recipes = await Review.find(filter).populate({path: 'userId', select: ['username', 'profilePic']});

    if (recipes.length > 0) {
      res.status(200).send(recipes);
    } else {
      res.status(200).send([]);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador GET de /reviews. Permite obtener la información de una receta a partir de su ID único pasado como parámetro dinámico.
 */
reviewRouter.get('/reviews/:id', async (req, res) => {
  try {
    const reviews = await Review.findById(req.params.id).populate({path: 'userId', select: ['username', 'profilePic']});
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
 * Manejador PATCH de /reviews. Permite actualizar la información de una receta mediante su ID pasado como parámetro dinámico.
 */
reviewRouter.patch('/reviews/:id', async (req, res) => {
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
reviewRouter.delete('/reviews', async (req, res) => {
  const { recipeId, userId, creationDate } = req.query;

  const filter: any = {};
  if (recipeId) {
    if (mongoose.Types.ObjectId.isValid(recipeId as string)) {
      filter.recipeId = recipeId;
    } else {
      console.log('ID de receta no válido.')
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      console.log('ID de usuario no válido.')
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (creationDate) {
        const date = new Date(creationDate as string);
        if (!isNaN(date.getTime())) {
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            filter.creationDate = { $gte: date, $lt: nextDate };
        } else {
            return res.status(400).send({ error: 'Fecha de creación no válida.' });
        }
  }

  try {
    const reviews = await Review.deleteMany(filter);
    if (reviews.deletedCount === 0) {
      return res.status(404).send({ error: 'Reseña no encontrada con el filtro proporcionado.' });
    }
    res.status(200).send(reviews);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador DELETE de /reviews. Permite borrar una receta según su ID pasado como un parámetro dinámico.
 */
reviewRouter.delete('/reviews/:id', async (req, res) => {
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