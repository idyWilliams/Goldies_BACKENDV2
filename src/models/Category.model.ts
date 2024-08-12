import { model, Document, Schema } from "mongoose";

interface categorySchemaI extends Document {
  name: string;
  description: string;
  categorySlug: string;
  image: string;
}

const categorySchema = new Schema<categorySchemaI>({
  name: { type: String, require: [true, "Please provide a category name"] },
  description: {
    type: String,
    require: [true, "Please provide category description"],
  },
  categorySlug: String,
  image: { type: String, require: [true, "Please provide category image"] },
});

const Category = model<categorySchemaI>("Category", categorySchema);
export default Category;
