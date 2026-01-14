import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: IReview[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const ProductSchema: Schema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: [ReviewSchema], default: [] },
  stock: { type: Number, default: 0 },
}, { timestamps: true, _id: false });

export default mongoose.model<IProduct>('Product', ProductSchema);
