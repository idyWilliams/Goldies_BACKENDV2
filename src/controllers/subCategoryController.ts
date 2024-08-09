import { Request, Response } from "express";
import SubCategory from "../models/SubCategory.model";

// Create SubCategories
const createSubCategory = async (req: Request, res: Response) => {
  const { name, description, image, status } = req.body;

  try {
    const subCategory = await SubCategory.create({
      name,
      description,
      image,
      status,
    });
    res.status(200).json({
      error: false,
      subCategory,
      message: "SubCategory created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      messaage: "Internal server error, Please try again",
    });
  }
};
export { createSubCategory };
