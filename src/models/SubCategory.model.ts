import { model, Document, Schema } from "mongoose";

export interface SubCategorySchemaI extends Document {
  name: string;
  description: string;
  subCategorySlug: string;
  image: string;
  status: boolean;
  categoryId: Schema.Types.ObjectId;
  // Virtual field for product count
  productCount?: number;
}

const subCategorySchema = new Schema<SubCategorySchemaI>(
  {
    name: {
      type: String,
      required: [true, "Please provide a sub category name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide subCategory description"],
      trim: true,
    },
    subCategorySlug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, "Please provide sub category image"],
    },
    status: {
      type: Boolean,
      required: [true, "SubCategory status is required"],
      default: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


subCategorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "subCategories",
  justOne: false,
  count: true,
});

const SubCategory = model<SubCategorySchemaI>("SubCategory", subCategorySchema);
export default SubCategory;
