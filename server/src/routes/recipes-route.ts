import express from 'express'
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import { Recipe } from '../items/recipe.js' 
import { Review } from '../items/review.js';
import { upload } from '../middleware/multer.js';
import { deleteFileIfExists } from '../utils/deleteUpload.js';
import { User } from '../items/user.js'; 
import { auth, AuthRequest } from '../middleware/auth.js';

/**
 * Router de recipe.
 */
export const recipeRouter = express.Router();

const port = process.env.PORT || 3000

recipeRouter.use(express.json());

/**
 * Manejador POST de /recipes. Permite almacenar el documento de una receta.
 */
recipeRouter.post('/recipes', async (req, res) => {
  const recipe = new Recipe(req.body);

  try {
    await recipe.save();
    res.status(201).send(recipe);
  } catch (err) {
    res.status(400).send(err);
  }
}); 

/**
 * Manejador POST de /recipes. Permite almacenar el documento de una receta.
 */
recipeRouter.post('/recipes/files', 
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 }
  ]), async (req, res) => {


  if (!req.files) {
    return res.status(400).send({ error: "Error al subir archivos" });
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const imageFiles = files["images"] || [];
  const videoFiles = files["videos"] || [];

  const imagePaths = imageFiles.map(f => "uploads/images/" + f.filename);
  const videoPaths = videoFiles.map(f => "uploads/videos/" + f.filename);

  const recipe = new Recipe({
    name: req.body.name,
    steps: req.body.steps,
    ingredients: JSON.parse(req.body["ingredients"]),
    tools: req.body["tools"],
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
recipeRouter.get('/recipes', auth, async (req, res) => {
  const { name, steps, category, userId, tools, ingredientName, creacionDate } = req.query;

  const authenticatedRequest = req as AuthRequest;
  const searchTerms: string[] = [];

  const filter: any = {};
  if (name) {
    filter.name = { $regex: new RegExp(name as string, 'i') };
    searchTerms.push(`Nombre: ${name}`);
  }

  if (steps) filter.steps = { $regex: new RegExp(steps as string, 'i') };

  if (typeof category === 'string' && category.trim() !== '') {
    const categoriesArray = category.split(',').map(c => c.trim()).filter(c => c !== '');
    if (categoriesArray.length > 0) {
      filter.category = { $all: categoriesArray };
      searchTerms.push(`Categoría: ${categoriesArray.join(' y ')}`);
    }
  }
    
  if (userId) {
    if (mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = userId;
      searchTerms.push(`ID Usuario: ${userId}`);
    } else {
      return res.status(400).send({ error: 'ID de usuario no válido.' });
    }
  }
    
  if (typeof tools === 'string' && tools.trim() !== '') {
    const toolsArray = tools.split(',').map(t => t.trim()).filter(t => t !== '');
    if (toolsArray.length > 0) {
      filter.tools = { $all: toolsArray }; 
      searchTerms.push(`Utensilios: ${toolsArray.join(' y ')}`);
    }
  }

  if (typeof ingredientName === 'string' && ingredientName.trim() !== '') {
    const ingredientArray = ingredientName.split(',').map(i => i.trim()).filter(i => i !== '');
    if (ingredientArray.length > 0) {
      filter.ingredients = { $all: ingredientArray.map(i => new RegExp(i, 'i')) };
      searchTerms.push(`Ingredientes: ${ingredientArray.join(' y ')}`);
    }
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
      const searchString = searchTerms.join(' | ');
      if (authenticatedRequest.user && searchString) {
        const user = await User.findById(authenticatedRequest.user._id);
        if (user) {
          const newSearches = user.recentSearches.filter(s => s !== searchString); 
          newSearches.unshift(searchString);
          user.recentSearches = newSearches.slice(0, 5);
          user.save().catch(err => console.error('Error al guardar búsquedas recientes:', err));
        }
      }
    } else {
      res.status(404).send({ error: 'Receta no encontrada.' });
    }
  } catch (err) {
    console.error('Error en la búsqueda de recetas:', err); 
    res.status(500).send({ error: 'Error interno del servidor al procesar la búsqueda.'});
  }
});

/**
 * Manejador GET de /recipes. Permite obtener la información de una receta a partir de su ID único pasado como parámetro dinámico.
 */
// recipeRouter.get('/recipes/:id', async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id).populate({path: 'userId', select: ['username', 'profilePic']});
//       if (recipe) {
//         res.send(recipe);
//       } else {
//         res.status(404).send({ error: 'Receta no encontrada.' });
//       }
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

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

      recipe.images.forEach((p: string) => deleteFileIfExists(p));
      recipe.videos?.forEach((p: string) => deleteFileIfExists(p));
      
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

      recipe.images.forEach((p: string) => deleteFileIfExists(p));
      recipe.videos?.forEach((p: string) => deleteFileIfExists(p));
      
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

const shuffleArray = (array: Types.ObjectId[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

recipeRouter.get('/recipes/feed', auth, async (req, res) => {
  const authenticatedRequest = req as AuthRequest;
  if (!authenticatedRequest.user) {
    return res.status(401).send({ error: 'Usuario no autenticado.' });
  }

  try {
    if (!Types.ObjectId.isValid(authenticatedRequest.user._id)) {
      return res.status(400).send({ error: 'ID de usuario no válido proporcionado.' });
    }

    const user = await User.findById(authenticatedRequest.user._id);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado.' });
    }

    const MAX_POSTS = 15;
    let allRecipeIds: Types.ObjectId[] = []; 
      
    if (user.following && user.following.length > 0) {
      const validFollowedIds = user.following.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id));
        
      if (validFollowedIds.length > 0) {
        const followedRecipes = await Recipe.find({
          userId: { $in: validFollowedIds }
        }, { _id: 1 }); 
  
        allRecipeIds.push(...followedRecipes.map(r => r._id as Types.ObjectId));
      }
    }

    if (user.recentSearches && user.recentSearches.length > 0) {
        
      const searchFilters = user.recentSearches.map(term => {
        const parts = term.split(': ');
        const mainValue = parts.length > 1 ? parts.slice(1).join(': ') : term; 
        const primaryTerm = mainValue.split(/ \| | y | /)[0].trim();
        
        if (primaryTerm.length === 0) return null; 
        const regexTerm = new RegExp(primaryTerm, 'i');
        
        return { 
          $or: [
            { name: { $regex: regexTerm } },
            { category: { $in: [regexTerm] } }
          ]
        };
      }).filter(f => f !== null);

      if (searchFilters.length > 0) {
        const recentSearchRecipes = await Recipe.find({
          $or: searchFilters,
          _id: { $nin: allRecipeIds } 
        }, { _id: 1 }); 
        allRecipeIds.push(...recentSearchRecipes.map(r => r._id as Types.ObjectId));
      }
    }

    const generalRecipes = await Recipe.find({
        _id: { $nin: allRecipeIds } 
    }, { _id: 1 })
    .sort({ creacionDate: -1 })
    .limit(200); 

    allRecipeIds.push(...generalRecipes.map(r => r._id as Types.ObjectId));
    
    const uniqueStringIds = Array.from(new Set(allRecipeIds.map(id => id.toString())));
    const finalUniqueIds = uniqueStringIds.map(id => new Types.ObjectId(id)); 
    shuffleArray(finalUniqueIds); 
    const finalIds = finalUniqueIds.slice(0, MAX_POSTS);

    const recipes = await Recipe.find({
      _id: { $in: finalIds }
    })
    .populate({ path: 'userId', select: ['username', 'profilePic'] });
      
    const finalRecipes = finalIds.map(id => 
      recipes.find(r => r._id.equals(id))
    ).filter(r => r !== undefined);
    res.status(200).send(finalRecipes);

  } catch (err) {
    res.status(500).send({ error: 'Error interno del servidor al generar el feed.' });
  }
});