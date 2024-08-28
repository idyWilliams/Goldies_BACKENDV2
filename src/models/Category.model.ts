import { model, Document, Schema } from "mongoose";

interface categorySchemaI extends Document {
  name: string;
  description: string;
  categorySlug: string;
  image: string;
  status: Boolean
}

const categorySchema = new Schema<categorySchemaI>({
  name: { type: String, require: [true, "Please provide a category name"] },
  description: {
    type: String,
    require: [true, "Please provide category description"],
  },
  categorySlug: { type: String, unique: true },
  image: { type: String, require: [true, "Please provide category image"] },
  status: {
      type: Boolean,
      require: [true, "SubCategory status is not provided"],
    },
}, {
  timestamps: true
});

const Category = model<categorySchemaI>("Category", categorySchema);
export default Category;
