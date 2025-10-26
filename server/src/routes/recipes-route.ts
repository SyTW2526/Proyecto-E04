import express from 'express'
import mongoose from 'mongoose';
import { Recipe } from '../items/recipe.js' 

/**
 * Router de recipe.
 */
export const recipeRouter = express.Router();

const port = process.env.PORT || 3000

recipeRouter.use(express.json());

/**
 * Manejador POST de /recipe. Permite almacenar el documento de una receta.
 */
recipeRouter.post('/recipes', async (req, res) => {
  const good = new Recipe(req.body);

  try {
    await good.save();
    res.status(201).send(good);
  } catch (err) {
    res.status(400).send(err);
  }
}); 

/**
 * Manejador GET de /recipe. Permite obtener la información de una serie de recetas por cualquiera de sus campos recibidos como query string.
 */
recipeRouter.get('/recipes', async (req, res) => {
  const { name, steps, category, userId, tools, ingredientName, creacionDate } = req.query;

  const filter: any = {};
  if (name) filter.name = { $regex: new RegExp(name as string, 'i') };
  if (steps) filter.steps = { $regex: new RegExp(steps as string, 'i') };
  if (category) filter.category = category;
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
  if (tools) filter.tools = tools;
  if (ingredientName) {
    filter.ingredients = {
      $elemMatch: {
        nombre: { $regex: new RegExp(ingredientName as string, 'i') }
      }
    };
  }

	if (creacionDate) {
		const date = new Date(creacionDate as string);
		if (!isNaN(date.getTime())) {
			const nextDate = new Date(date);
			nextDate.setDate(nextDate.getDate() + 1);
			filter.creacionDate = { $gte: date, $lt: nextDate };
		} else {
			return res.status(400).send({ error: 'Fecha de creación no válida.' });
		}
  }

  try {
    const recipes = await Recipe.find(filter);

    if (recipes.length > 0) {
      res.status(200).send(recipes);
    } else {
      res.status(404).send({ error: 'Receta no encontrada.' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador GET de /recipes. Permite obtener la información de una receta a partir de su ID único pasado como parámetro dinámico.
 */
recipeRouter.get('/recipes/:id', async (req, res) => {
  try {
    const good = await Recipe.findById(req.params.id);
      if (good) {
        res.send(good);
      } else {
        res.status(404).send({ error: 'Receta no encontrada.' });
      }
  } catch (err) {
    res.status(500).send(err);
  }
});