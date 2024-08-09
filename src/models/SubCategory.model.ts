import { model, Document, Schema } from "mongoose";

interface subCategorySchemaI extends Document {
  name: string;
  description: string;
  categorySlug: string;
  images: string[] | undefined;
}

const subCategorySchema = new Schema<subCategorySchemaI>({
  name: { type: String, require: [true, "Please provide a sub category name"] },
  description: {
    type: String,
    require: [true, "Please provide subCategory description"],
  },
  images: {
    type: Array,
    require: [true, "Please provide sub category images"],
  },
});

const SubCategory = model<subCategorySchemaI>("SubCategory", subCategorySchema);
export default SubCategory;
