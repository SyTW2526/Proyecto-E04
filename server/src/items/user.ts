import { Types, model, Schema } from 'mongoose';
import validator from 'validator';
//import { RecipeInterface, Recipe } from './recipe.js';

/**
 * Interfaz UserInterface.
 * Representa a un usuario de la aplicación.
 */
export interface UserInterface {
  username: string;
  email: string;
  password: string;
  profilePic?: string;   // URL de la foto de perfil
  bio?: string;          // Descripción opcional
  followers: Types.ObjectId[];
  following: Types.ObjectId[];  
  savedRecipe?: Types.ObjectId[]; // Referencias a recetas guardadas 
  createdAt: Date;
}

/**
 * Esquema UserSchema.
 * Representa la información almacenada de cada usuario.
 */
const UserSchema = new Schema<UserInterface>({
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
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
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
  savedRecipe: {
    type: { type: [Schema.Types.ObjectId], default: [], ref: 'Recipe'}

  }
  ,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual para contar seguidores
UserSchema.virtual('followersCount').get(function ()
{return this.followers.length; });

export const User = model<UserInterface>('User', UserSchema);
