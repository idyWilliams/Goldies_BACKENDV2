import Category from "../models/Category.model";
import { Request, Response } from "express";

//  create category
const createCategory = async (req: Request, res: Response) => {
  const { name, description, images, categorySlug } = req.body;

  if (!name)
    return res.status(200).json({
      error: true,
      message: "Please provide a category name",
    });

  if (!description)
    return res.status(200).json({
      error: true,
      message: "Please provide category description",
    });

  if (!images)
    return res.status(200).json({
      error: true,
      message: "Please provide category images",
    });

  try {
    const category = await Category.create({
      name,
      description,
      images,
      categorySlug,
    });

    res.status(200).json({
      error: false,
      category,
      message: "new category created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error, Pleasee try again",
    });
  }
};

// update category
const editCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const { name, description, images, categorySlug } = req.body;
  try {
    const categoryDetails = await Category.findOne({ _id: categoryId });

    if (!categoryDetails)
      return res.status(200).json({
        error: true,
        message: "category not found",
      });

    if (name) categoryDetails.name = name;
    if (description) categoryDetails.description = description;
    if (images) categoryDetails.images = images;
    if (categorySlug) categoryDetails.categorySlug = categorySlug;

    await categoryDetails.save();

    res.status(200).json({
      error: false,
      category: categoryDetails,
      message: "category updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error",
    });
  }
};

// Get all categories
const getAllCategories = async (req: Request, res: Response) => {
  try {
    const category = await Category.find();

    res.status(200).json({
      error: false,
      category,
      message: "All category retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error",
    });
  }
};

// Get category
const getCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(200).json({
        error: true,
        message: "category not found",
      });
    }
    res.status(200).json({
      error: false,
      category,
      message: "category fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error",
    });
  }
};

// Delete category
const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    const categoryDetails = await Category.deleteOne({ _id: categoryId });
    if (!categoryDetails) {
      return res.status(404).json({
        error: true,
        message: "category not found",
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
  createCategory,
  editCategory,
  getAllCategories,
  getCategory,
  deleteCategory,
};
