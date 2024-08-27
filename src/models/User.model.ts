import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  billingInfo: {
    firstName: { type: String, require: [true, "Please provide billing first name to complete this process"]},
    lastName: { type: String, require: [true, "Please provide billing last name to complete this process"]},
    email: { type: String, require: [true, "Please provide billing email to complete this process"]},
    country: { type: String, require: [true, "Please provide country to complete this process"]},
    cityOrTown: { type: String, require: [true, "Please provide city or town to complete this process"]},
    streetAddress: { type: String, require: [true, "Please provide street address to complete this process"]},
    phoneNumber: { type: Number, require: [true, "Please provide phone number to complete this process"]},
    defaultBillingInfo: { type: Boolean, default: false},
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", UserSchema);

export default User;
