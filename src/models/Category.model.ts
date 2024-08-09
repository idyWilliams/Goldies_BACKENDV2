import { model, Document, Schema } from "mongoose";

interface categorySchemaI extends Document {
  name: string;
  description: string;
  categorySlug: string;
  images: string[] | undefined;
}

const categorySchema = new Schema<categorySchemaI>({
  name: { type: String, require: [true, "Please provide a category name"] },
  description: {
    type: String,
    require: [true, "Please provide category description"],
  },
  categorySlug: String,
  images: { type: Array, require: [true, "Please provide category images"] },
});

const Category = model<categorySchemaI>("Category", categorySchema);
export default Category;
