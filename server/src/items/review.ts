import { connect, model, Schema } from 'mongoose';
import validator from 'validator';

/**
 * Interfaz Review. Representa una receta.
 */
export interface ReviewInterface {
  userId: Schema.Types.ObjectId; 
  recipeId: Schema.Types.ObjectId;
  rating: number;
  text: string;
  creationDate: Date;
}

/**
 * Esquema RecetaSchema.
 * Representa toda la información que se ha de almacenar sobre una receta.
 */
const ReviewSchema = new Schema<ReviewInterface>({
  userId: { 
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  recipeId: { 
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Recipe',
  },
  rating: { 
    type: Number,
    required: true,
    validate: (value: number) => {
        if (value < 0 || value > 5) {
            throw new Error('La valoración tiene que tener un valor entre 0 y 5.');
        }
    }
  },
  text: { 
    type: String
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

export const Review = model<ReviewInterface>('Review', ReviewSchema);