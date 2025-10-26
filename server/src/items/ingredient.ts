import { model, Schema } from 'mongoose';

export interface IngredientInterface {
  name: string;
  quantity: string;
  unit?: string;
  brand?: string;
}

const IngredientSchema = new Schema<IngredientInterface>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: { // Cantidad del ingrediente
    type: String,
    required: true,
    trim: true,
  },
  unit: { // Unidad de medida como gramos, cucharadas, etc.
    type: String,
    trim: true,
  },
  brand: { 
    type: String,
    trim: true,
  }
}, { _id: false });

export const Ingredient = model<IngredientInterface>('Ingredient', IngredientSchema); 