import { connect, model, Schema } from 'mongoose';
import validator from 'validator';
import { IngredientInterface, Ingredient } from './ingredient.js';
import { ReviewInterface, Review } from './review.js';

/**
 * Interfaz Recipe. Representa una receta.
 */
export interface RecipeInterface {
  name: string;
  steps: string;
  ingredients: IngredientInterface[];
  tools: string[];
  userId: Schema.Types.ObjectId; 
  category: string; // Pasta, postre, carne, etc. 
  images: string[]; // URLs de imágenes o vídeos 
  videos?: string[]; // URLs de vídeos 
  reviews: ReviewInterface[];
  creacionDate: Date;
}

/**
 * Esquema RecetaSchema.
 * Representa toda la información que se ha de almacenar sobre una receta.
 */
const RecipeSchema = new Schema<RecipeInterface>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  steps: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [Ingredient], // Lista de ingredientes
    required: true,
  },
  tools: { // Lista de utensilios 
    type: [String],
    required: true,
  },
  userId: { 
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: { // Categoría (tipo de plato o dieta)
    type: String,
    required: true,
    enum: [
        'entrante',
        'plato principal',
        'guarnición',
        'postre',
        'desayuno',
        'merienda',
        'bebida',
        'salsa o aderezo',
        'panadería',
        'pasta',
        'arroz',
        'carne', 
        'pescado',
        'marisco',
        'pollo',
        'vegetariano', 
        'vegano',
        'sin gluten',
        'bajo en carbohidratos',
        'alto en proteínas',
        'otro'
    ],
  },
  images: {
    type: [String],
    default: [],
  },
  videos: {
    type: [String],
    default: [],
  },
  reviews: {
    type: [Review], 
    default: [],
  },
  creacionDate: {
    type: Date,
    default: Date.now,
  },
});

RecipeSchema.virtual('valoracionMedia').get(function() {
  if (this.reviews.length === 0) {
    return 0;
  }
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

export const Recipe = model<RecipeInterface>('Recipe', RecipeSchema);