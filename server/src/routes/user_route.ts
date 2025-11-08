import express from 'express';
import mongoose from 'mongoose';
import { User } from '../items/user.js';
import { receiveMessageOnPort } from 'worker_threads';
import { Recipe } from '../items/recipe.js';
import { Review } from '../items/review.js';

/**
 * Router de usuarios.
 */
export const userRouter = express.Router();

const port = process.env.PORT || 3000;

userRouter.use(express.json());

/**
 * Manejador POST de /users. Permite crear un nuevo usuario.
 */
userRouter.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Manejador GET de /users. Permite obtener usuarios filtrando por username o email.
 */
userRouter.get('/users', async (req, res) => {
  const { username, email } = req.query;

  const filter: any = {};
  if (username) filter.username = { $regex: new RegExp(username as string, 'i') };
  if (email) filter.email = { $regex: new RegExp(email as string, 'i') };

  try {
    const users = await User.find(filter);
    if (users.length > 0) {
      res.status(200).send(users);
    } else {
      res.status(404).send({ error: 'Usuario(s) no encontrado(s).' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador GET de /users/:id. Permite obtener un usuario por su ID.
 */
userRouter.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: 'Usuario no encontrado.' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador PATCH de /users. Permite actualizar usuarios según username o email.
 */
userRouter.patch('/users', async (req, res) => {
  const { username, email } = req.query;

  const filter: any = {};
  if (!username && !email) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (username o email) para identificar al usuario a modificar.',
    });
  }

  if (username) filter.username = { $regex: new RegExp(username as string, 'i') };
  if (email) filter.email = { $regex: new RegExp(email as string, 'i') };

  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      error: 'Los campos a modificar deben proporcionarse en el cuerpo de la solicitud.',
    });
  }

  const allowedUpdates = ['username', 'email', 'password'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'La actualización contiene campos no permitidos o inválidos.',
    });
  }

  try {
    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado con el filtro proporcionado.' });
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Manejador PATCH de /users/:id. Permite actualizar un usuario por su ID.
 */
userRouter.patch('/users/:id', async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      error: 'Los campos a modificar deben proporcionarse en el cuerpo de la solicitud.',
    });
  }

  const allowedUpdates = ['username', 'email', 'password'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'La actualización contiene campos no permitidos o inválidos.',
    });
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).send({ error: 'Usuario no encontrado.' });
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * Manejador DELETE de /users. Permite eliminar un usuario según username o email.
 */
userRouter.delete('/users', async (req, res) => {
  const { username, email } = req.query;

  const filter: any = {};
  if (!username && !email) {
    return res.status(400).send({
      error: 'Debe proporcionar al menos un filtro (username o email) para identificar al usuario a borrar.',
    });
  }

  if (username) filter.username = { $regex: new RegExp(username as string, 'i') };
  if (email) filter.email = { $regex: new RegExp(email as string, 'i') };

  try {
    const user = await User.findOne(filter);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado con el filtro proporcionado.' });
    } else {
      const resultRecipe = await Recipe.deleteMany({ userId: user._id})
      const resultReview = await Review.deleteMany({ userId: user._id})

      if (!resultRecipe.acknowledged || !resultReview.acknowledged) {
          res.status(500).send();
      } else {
        await User.findByIdAndDelete(user._id);
        res.send(user);
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador DELETE de /users/:id. Permite eliminar un usuario por su ID.
 */
userRouter.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({ error: 'Usuario no encontrado.' });
    } else {
      const resultRecipe = await Recipe.deleteMany({ userId: user._id})
      const resultReview = await Review.deleteMany({ userId: user._id})

      if (!resultRecipe.acknowledged || !resultReview.acknowledged) {
          res.status(500).send();
      } else {
        await User.findByIdAndDelete(user._id);
        res.send(user);
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
