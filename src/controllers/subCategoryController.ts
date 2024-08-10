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

// Get all subCategory
const getAllSubCategory = async (req: Request, res: Response) => {
  try {
    const subCategories = await SubCategory.find();
    return res.status(200).json({
      error: true,
      subCategories,
      message: "All sub Categories fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      messaage: "Internal server error, Please try again",
    });
  }
};

// Get sub category
const getSubCategory = async (req: Request, res: Response) => {
  const { subCategoryId } = req.params;
  try {
    const subCategory = await SubCategory.findOne({ _id: subCategoryId });

    if (!subCategory) {
      return res.status(200).json({
        error: true,
        message: "subCategory not found, please try again with the correct ID",
      });
    }

    return res.status(200).json({
      error: true,
      subCategory,
      message: "subCategory data fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      messaage: "Internal server error, Please try again",
    });
  }
};

// delete subCategory
const deleteSubCategory = async (req: Request, res: Response) => {
  const { subCategoryId } = req.params;
  try {
    const subCategory = await SubCategory.deleteOne({ _id: subCategoryId });
    if (!subCategory) {
      return res.status(404).json({
        error: true,
        message: "SubCategory not found",
      });
    }
    return res.json({
      error: false,
      message: "category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      err,
      message: "Internal server Error",
    });
  }
};

export {
  createSubCategory,
  updateSubCategory,
  getAllSubCategory,
  getSubCategory,
};