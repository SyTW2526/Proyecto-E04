import { Types, model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

/**
 * Interfaz UserInterface.
 * Representa a un usuario de la aplicación.
 */
export interface UserInterface {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePic?: string;   // URL de la foto de perfil
  bio?: string;          // Descripción opcional
  followers: Types.ObjectId[];
  following: Types.ObjectId[];   
  recentSearches: string[];
  saved: Types.ObjectId[];
  createdAt: Date;
}

/**
 * Esquema UserSchema.
 * Representa la información almacenada de cada usuario.
 */
const UserSchema = new Schema<UserInterface>({
  _id: {
    type: Schema.Types.ObjectId
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres.'],
    maxlength: [20, 'El nombre de usuario no puede exceder los 20 caracteres.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'El correo electrónico no es válido.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
  },
  profilePic: {
    type: String,
    default: "uploads/images/Flaticon.png"
  },
  bio: {
    type: String,
    maxlength: [200, 'La biografía no puede superar los 200 caracteres.']
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  recentSearches: {
    type: [String], 
    default: [], 
  },
  saved: {
    type: [Schema.Types.ObjectId],
    ref: 'Recipe',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual para contar seguidores
UserSchema.virtual('followersCount').get(function ()
{return this.followers.length; });
/**
 * Middleware para hashear la contraseña antes de guardar el usuario.
 */
UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

/**
 * Virtual para obtener el número de recetas creadas por el usuario.
 */
// UserSchema.virtual('recipesCount').get(function () {
//   return this.posts.length;
// });

export const User = model<UserInterface>('User', UserSchema);