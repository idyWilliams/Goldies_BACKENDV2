import Category from "../models/Category.model";
import Order from "../models/Order.model";
import User from "../models/User.model";

export const getAnalyticsSummary = async () => {
  const cakesDelivered = await Order.countDocuments();
  const verifiedCustomers = await User.countDocuments();
  const recipesCount = await Category.countDocuments();

  return {
    cakesDelivered,
    verifiedCustomers,
    recipesCount,
  };
};
