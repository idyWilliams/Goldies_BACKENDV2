import { Schema, model, Document, Types } from "mongoose";

interface IReview extends Document {
  user: Types.ObjectId;  
  product: Types.ObjectId;  
  rating: number; 
  comment: string;  

}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },  
    comment: { type: String, required: false },
  },
  { timestamps: true }  
);

const Review = model<IReview>("Review", reviewSchema);

export default Review;
