import express from 'express'
import mongoose from 'mongoose';
import { Recipe } from '../items/recipe.js' 
import { Review } from '../items/review.js';
import { upload } from '../middleware/multer.js';

/**
 * Router de recipe.
 */
export const recipeRouter = express.Router();

const port = process.env.PORT || 3000

recipeRouter.use(express.json());

/**
 * Manejador POST de /recipe. Permite almacenar el documento de una receta.
 */
recipeRouter.post('/recipes', 
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 }
  ]), async (req, res) => {


  if (!req.files || Array.isArray(req.files)) {
    return res.status(400).send({ error: "Error al subir archivos" });
  }

  const imageFiles = req.files["images"] || [];
  const videoFiles = req.files["videos"] || [];

  const imagePaths = imageFiles.map(f => "~/uploads/images/" + f.filename);
  const videoPaths = videoFiles.map(f => "~/uploads/videos/" + f.filename);

  const recipe = new Recipe({
    name: req.body.name,
    steps: req.body.steps,
    ingredients: req.body["ingredients[]"],
    tools: req.body["tools[]"],
    category: req.body.category,
    userId: req.body.userId,
    images: imagePaths,
    videos: videoPaths
  });

  try {
    await recipe.save();
    res.status(201).send(recipe);
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
    filter.ingredients = { $in: [new RegExp(ingredientName as string, 'i')] };
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
    const recipes = await Recipe.find(filter).populate({path: 'userId', select: ['username', 'profilePic']});

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
    const recipe = await Recipe.findById(req.params.id).populate({path: 'userId', select: ['username', 'profilePic']});
      if (recipe) {
        res.send(recipe);
      } else {
        res.status(404).send({ error: 'Receta no encontrada.' });
      }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador PATCH de /recipes. Permite actualizar la información de una receta a partir de la query string de cualquiera de sus campos.
 */
recipeRouter.patch('/recipes', async (req, res) => {
  const { name, category, userId } = req.query;

  const filter: any = {};
  if (!name && !category && !userId) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (name, category o userId) en la query string para identificar la(s) receta(s) a modificar.',
    });
  }
  if (name) filter.name = { $regex: new RegExp(name as string, 'i') };
  if (category) filter.category = category;
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }

  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      error: 'Los campos a modificar tienen que proporcionarse en el cuerpo de la solicitud (req.body).',
    });
  }

  const allowedUpdates = ['name', 'steps', 'tools', 'category', 'images', 'videos','ingredients'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'La actualización contiene campos no permitidos o inválidos.',
    });
  } 

  try {
    const recipe = await Recipe.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!recipe) {
      return res.status(404).send({ error: 'Receta(s) no encontrada(s) con el filtro proporcionado.' });
    }

    res.status(200).send(recipe);
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Manejador PATCH de /recipes. Permite actualizar la información de una receta mediante su ID pasado como parámetro dinámico.
 */
recipeRouter.patch('/recipes/:id', async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  } else {
    const allowedUpdates = ['name', 'steps', 'tools', 'category', 'images', 'videos','ingredients'];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate =
        actualUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      res.status(400).send({
        error: 'Update is not permitted',
      });
    } else {
      try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!recipe) {
          res.status(404).send();
        } else {
          res.send(recipe);
        }
      } catch (err) {
        res.status(400).send(err);
      }
    }
  }
});

/**
 * Manejador DELETE de /recipes. Permite borrar una receta según cualquiera de sus campos.
 */
recipeRouter.delete('/recipes', async (req, res) => {
  const { name, steps, category, userId } = req.query;

  const filter: any = {};
  if (!name && !steps && !category && !userId) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (name, steps, category o userId) en la query string para identificar la receta a borrar.',
    });
  }

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

  try {
    const recipe = await Recipe.findOne(filter);
    if (!recipe) {
      return res.status(404).send({ error: 'Receta no encontrada con el filtro proporcionado.' });
    } else {
      const result = await Review.deleteMany({ userId: recipe._id})
      
      if (!result.acknowledged) {
        res.status(500).send();
      } else {
        await Recipe.findByIdAndDelete(recipe._id);
        res.send(recipe);
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador DELETE de /recipes. Permite borrar una receta según su ID pasado como un parámetro dinámico.
 */
recipeRouter.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      res.status(404).send();
    } else {
      const result = await Review.deleteMany({ userId: recipe._id})
      
      if (!result.acknowledged) {
        res.status(500).send();
      } else {
        await Recipe.findByIdAndDelete(recipe._id);
        res.send(recipe);
      }
    }
  } catch (err) {
    res.status(500).send();
  }
});