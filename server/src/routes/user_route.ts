import express from 'express';
import mongoose, { Schema } from 'mongoose';
import { User } from '../items/user.js';
import { receiveMessageOnPort } from 'worker_threads';
import { Recipe } from '../items/recipe.js';
import { Review } from '../items/review.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { upload } from '../middleware/multer.js';
import { deleteFileIfExists } from '../utils/deleteUpload.js';

/**
 * Router de usuarios.
 */
export const userRouter = express.Router();

const port = process.env.PORT || 3000;

const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

/**
 * Manejador POST de /users. Permite crear un nuevo usuario.
 */
userRouter.post('/users', async (req, res) => {
  const user = new User({ ...req.body, _id: new mongoose.Types.ObjectId()});

  try {
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    console.log(err)
    res.status(400).send(err);
  }
});

userRouter.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { _id: user._id.toString() },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).send({ user });
    } catch (e) {
        res.status(500).send({ error: 'Error del servidor durante la autenticación.' });
    }
});

/**
 * GET /users/me: Obtiene el perfil del usuario autenticado. 
 */
userRouter.get('/users/me', auth, async (req, res) => {
    const authenticatedRequest = req as AuthRequest;
    res.status(200).send(authenticatedRequest.user); 
});

/**
 * PATCH /users/me: Permite actualizar el perfil del usuario autenticado.
 */
userRouter.patch('/users/me', auth, async (req, res) => { 
    const authenticatedRequest = req as AuthRequest;
    const updates = Object.keys(authenticatedRequest.body);
    const allowedUpdates = ['username', 'email', 'password', 'profilePic', 'bio']; 
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).send({ error: 'La actualización contiene campos no permitidos o inválidos.' });
    }
    
    if (updates.length === 0) {
        return res.status(400).send({ error: 'Los campos a modificar deben proporcionarse en el cuerpo de la solicitud.' });
    }
    try {
        const user = authenticatedRequest.user;
        updates.forEach((update) => {
            (user as any)[update] = authenticatedRequest.body[update];
        });
        await (user as any).save(); 
        const userObject = (user as any).toObject();
        delete userObject.password;
        res.status(200).send(userObject);
    } catch (err) {
        res.status(400).send(err);
    }
});

/**
 * DELETE /users/me: Permite eliminar la cuenta del usuario autenticado. (PROTEGIDA)
 */
userRouter.delete('/users/me', auth, async (req, res) => {
    try {
        const regex: RegExp = new RegExp("default/*");

        if (!regex.test((req as AuthRequest).user.profilePic!) && (req as AuthRequest).user.profilePic !== "uploads/images/Flaticon.png") deleteFileIfExists((req as AuthRequest).user.profilePic!);
        await User.findByIdAndDelete((req as AuthRequest).user._id);
        res.status(200).send((req as AuthRequest).user);
    } catch (err) {
        res.status(500).send(err);
    }
});

userRouter.post('/users/logout', auth, async (req, res) => {
    const authenticatedRequest = req as AuthRequest;
    try { 
        res.clearCookie('token');
        res.status(200).send({ message: `${authenticatedRequest.user.username} ha cerrado sesión exitosamente.` });
    } catch (e) {
        res.status(500).send({ error: 'Fallo al procesar el cierre de sesión.' });
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

userRouter.get('/users/:id/follows', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const follows = [];
      for (let usr of user.following) {
        follows.push(await User.findById(usr));
      }
      res.send(follows);
    } else {
      res.status(404).send({ error: 'Usuario no encontrado.' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

userRouter.get('/users/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const followers = [];
      for (let usr of user.followers) {
        followers.push(await User.findById(usr));
      }
      res.send(followers);
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

  const allowedUpdates = ['username', 'email', 'bio', 'password', 'following', 'followers', 'saved'];
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

  const allowedUpdates = ['username', 'email', 'bio', 'password', 'following', 'followers', 'saved'];
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

userRouter.patch('/users/:id/files', upload.fields([
    { name: "profilePic", maxCount: 1 }
  ]), async (req, res) => {

  if (!req.files) {
    return res.status(400).send({ error: "Error al subir archivos" });
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const imageFiles = files["profilePic"] || [];

  const imagePaths = imageFiles.map(f => "uploads/images/" + f.filename);

  try {
    const user = await User.findByIdAndUpdate(req.params.id, { profilePic: imagePaths[0] });

    if (user) {
      res.send(user);
    } else {
      res.status(404).send('No se encontró el usuario.');
    }
  } catch (error) {
    res.status(400).send('Error en la modificación de la foto de perfil.');
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

        const regex: RegExp = new RegExp("default/*");
        if (!regex.test(user.profilePic!) && user.profilePic !== "uploads/images/Flaticon.png") deleteFileIfExists(user.profilePic!);

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

        const regex: RegExp = new RegExp("default/*");

        if (!regex.test(user.profilePic!) && user.profilePic !== "uploads/images/Flaticon.png") deleteFileIfExists(user.profilePic!);

        res.clearCookie('token');
        res.send(user);
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
