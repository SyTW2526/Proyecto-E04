import express from 'express';
import mongoose from 'mongoose';
import { User } from '../items/user.js';
import { auth, AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Router de usuarios.
 */
export const userRouter = express.Router();

const port = process.env.PORT || 3000;

userRouter.use(express.json());

const JWT_SECRET = 'fallback-secret-for-dev-only-654321';

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
        const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET, { expiresIn: '7 days' });
        res.status(200).send({ user, token });
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
        await User.findByIdAndDelete((req as AuthRequest).user._id);
        res.status(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

userRouter.post('/users/logout', auth, async (req, res) => {
    const authenticatedRequest = req as AuthRequest;
    try { 
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
    const user = await User.findOneAndDelete(filter);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado con el filtro proporcionado.' });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Manejador DELETE de /users/:id. Permite eliminar un usuario por su ID.
 */
userRouter.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).send({ error: 'Usuario no encontrado.' });
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});
