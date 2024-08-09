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

// Update subCategory
const updateSubCategory = async (req: Request, res: Response) => {
  const { subCategoryId } = req.params;
  const { name, description, image, status } = req.body;
  try {
    const subCategory = await SubCategory.findOne({ _id: subCategoryId });

    // if (!name || !description || !image || !status) {
    //     return res.status()
    // }

    if (!subCategory) {
      return res.status(200).json({
        error: true,
        message: "subCategory not found, please try again with the correct ID",
      });
    }

    if (name) subCategory.name = name;
    if (description) subCategory.description = description;
    if (image) subCategory.image = image;
    if (status) subCategory.status = status;

    return res.status(200).json({
      error: false,
      subCategory,
      message: "SubCategory updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      messaage: "Internal server error, Please try again",
    });
  }
};

export { createSubCategory, updateSubCategory };
