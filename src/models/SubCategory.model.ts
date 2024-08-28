import { model, Document, Schema } from "mongoose";

interface subCategorySchemaI extends Document {
  name: string;
  description: string;
  image: string;
  status: Boolean;
  categoryId: Schema.Types.ObjectId
}

const subCategorySchema = new Schema<subCategorySchemaI>(
  {
    name: {
      type: String,
      require: [true, "Please provide a sub category name"],
    },
    description: {
      type: String,
      require: [true, "Please provide subCategory description"],
    },
    image: {
      type: String,
      require: [true, "Please provide sub category images"],
    },
    status: {
      type: Boolean,
      require: [true, "SubCategory status is not provided"],
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  {
    timestamps: true,
  }
);

const SubCategory = model<subCategorySchemaI>("SubCategory", subCategorySchema);
export default SubCategory;
