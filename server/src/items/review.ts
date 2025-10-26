import { model, Schema } from 'mongoose';

export interface ReviewInterface {
  userId: Schema.Types.ObjectId;
  rating: number; 
  comment: string;
  date: Date;
}

const ReviewSchema = new Schema<ReviewInterface>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5, // Valoración entre 0 y 5 estrellas 
  },
  comment: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

export const Review = model<ReviewInterface>('Review', ReviewSchema); 