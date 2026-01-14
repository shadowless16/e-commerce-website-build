import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
}

if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const CategorySchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
