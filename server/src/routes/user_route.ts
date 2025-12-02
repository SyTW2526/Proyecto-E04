import express from 'express';
import mongoose from 'mongoose';
import { User } from '../items/user';
import multer from 'multer';
import path from 'path';
import fs from 'fs';



/**
 * Router de usuarios.
 */
export const userRouter = express.Router();


userRouter.use(express.json());


userRouter.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    res.json({
      message: "Perfil actualizado correctamente.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ error: "Error al actualizar el perfil." });
  }
 });


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

// Guardar receta
userRouter.post("/:userId/save/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Evitar duplicados
    if (!user.savedRecipe.includes(recipeId)) {
      user.savedRecipe.push(recipeId);
      await user.save();
    }

    res.json({ message: "Receta guardada correctamente", savedRecipes: user.savedRecipe });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar la receta" });
  }
});


// Obtener recetas guardadas
userRouter.get("/:userId/saved", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ savedRecipes: user.savedRecipes });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener recetas guardadas" });
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




// Ruta absoluta y estable a /uploads
const uploadDir = path.join(process.cwd(), "uploads");

// Crea la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

userRouter.post("/users/:id/upload", upload.single("profileImage"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No se subió ninguna imagen." });
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    res.status(200).send({
      message: "Imagen subida correctamente",
      profilePic: imageUrl,
      user,
    });
  } catch (err) {
    res.status(500).send({ error: "Error al subir la imagen.", details: err });
  }
});

/**
 * Seguir a un usuario
 */
userRouter.post("/users/:id/follow", async (req, res) => {
  const followerId = req.body.followerId;  // quien hace follow
  const targetId = req.params.id;          // a quién siguen

  if (!followerId) {
    return res.status(400).send({ error: "Debe proporcionar followerId en el body." });
  }

  if (followerId === targetId) {
    return res.status(400).send({ error: "Un usuario no puede seguirse a sí mismo." });
  }

  try {
    const follower = await User.findById(followerId);
    const target = await User.findById(targetId);

    if (!follower || !target) {
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    // Ya sigue al usuario
    if (target.followers.includes(followerId)) {
      return res.status(400).send({ error: "Ya sigues a este usuario." });
    }

    // Convertimos los IDs string a ObjectId
    follower.following.push(new mongoose.Types.ObjectId(targetId));
    target.followers.push(new mongoose.Types.ObjectId(followerId));

    await target.save();
    await follower.save();

    res.status(200).send({
      message: "Usuario seguido correctamente.",
      follower,
      target,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * Dejar de seguir a un usuario
 */
userRouter.post("/users/:id/unfollow", async (req, res) => {
  const followerId = req.body.followerId;
  const targetId = req.params.id;

  if (!followerId) {
    return res.status(400).send({ error: "Debe proporcionar followerId en el body." });
  }

  if (followerId === targetId) {
    return res.status(400).send({ error: "Un usuario no puede dejar de seguirse a sí mismo." });
  }

  try {
    const follower = await User.findById(followerId);
    const target = await User.findById(targetId);

    if (!follower || !target) {
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    // Comprobar si realmente lo sigue
    if (!target.followers.includes(followerId)) {
      return res.status(400).send({ error: "No sigues a este usuario." });
    }

    // Eliminar follower y following
    target.followers = target.followers.filter(id => id.toString() !== followerId);
    follower.following = follower.following.filter(id => id.toString() !== targetId);

    await target.save();
    await follower.save();

    res.status(200).send({
      message: "Se dejó de seguir al usuario correctamente.",
      follower,
      target,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * Obtener seguidores de un usuario
 */
userRouter.get("/users/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "username email profilePic");
    if (!user) return res.status(404).send({ error: "Usuario no encontrado." });

    res.status(200).send({
      count: user.followers.length,
      followers: user.followers,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * Obtener seguidores de un usuario
 */
userRouter.get("/users/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "username email profilePic");
    if (!user) return res.status(404).send({ error: "Usuario no encontrado." });

    res.status(200).send({
      count: user.followers.length,
      followers: user.followers,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * Obtener usuarios seguidos por un usuario
 */
userRouter.get("/users/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "username email profilePic");
    if (!user) return res.status(404).send({ error: "Usuario no encontrado." });

    res.status(200).send({
      count: user.following.length,
      following: user.following,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

