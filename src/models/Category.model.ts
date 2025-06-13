import { model, Document, Schema } from "mongoose";

export interface CategorySchemaI extends Document {
  name: string;
  description: string;
  categorySlug: string;
  image: string;
  status: boolean;
  // Virtual fields for counts
  productCount?: number;
  subCategoryCount?: number;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide category description"],
      trim: true,
    },
    categorySlug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, "Please provide category image"],
    },
    status: {
      type: Boolean,
      required: [true, "Category status is required"],
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fields for counts
categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
  justOne: false,
  count: true,
});

categorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "category",
  justOne: false,
  count: true,
});

const Category = model<CategorySchemaI>("Category", categorySchema);
export default Category;
