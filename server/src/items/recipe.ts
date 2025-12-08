import { connect, model, Schema } from 'mongoose';
import validator from 'validator';

/**
 * Interfaz Recipe. Representa una receta.
 */
export interface RecipeInterface {
  name: string;
  steps: string;
  ingredients: string[];
  tools: string[];
  userId: Schema.Types.ObjectId; 
  category: string[]; // Pasta, postre, carne, etc. 
  images: string[]; // URLs de imágenes o vídeos 
  videos?: string[]; // URLs de vídeos 
  creacionDate: Date;
}

const ingredients: string[] = [ 'harina', 'azucar', 'sal', 'huevo', 'leche', 'mantequilla', 'aceite', 'levadura', 'chocolate', 'vainilla', 'frutas', 'verduras', 'carne', 'pescado', 'especias' ];

/**
 * Esquema RecetaSchema.
 * Representa toda la información que se ha de almacenar sobre una receta.
 */
const RecipeSchema = new Schema<RecipeInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  steps: {
    type: String,
    required: true,
  },
  ingredients: {
    type: [{ingredient: String, quantity: String}], // Lista de ingredientes
    required: true,
    validate: (value: {ingredient: string, quantity: string}) => {
      if (ingredients.some((ing) => ing === value.ingredient)) {
        throw new Error('Se ha introducido un ingrediente no válido.');
      }
    }
  },
  tools: { // Lista de utensilios 
    type: [String],
    required: true,
    enum: [ 'cuchillo', 'tablaDeCortar', 'tabla de cortar', 'sartén', 'olla', 'batidora', 'horno', 'microondas', 'espátula', 'cucharón', 'colador', 'caldero', 'rodillo', 'rallador' ],
  },
  userId: { 
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: { // Categoría (tipo de plato o dieta)
    type: [String],
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
  creacionDate: {
    type: Date,
    default: Date.now,
  },
});

export const Recipe = model<RecipeInterface>('Recipe', RecipeSchema);