import { model, Schema } from 'mongoose';

export interface IngredientInterface {
  name: string;
}

const IngredientSchema = new Schema<IngredientInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

export const Ingredient = model<IngredientInterface>('Ingredient', IngredientSchema); 