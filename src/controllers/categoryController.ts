import { Request, Response } from "express";
import Category from "../models/Category.model";

const createCategory = async (req: Request, res: Response) => {
  const {
    name,
    description,
    images,
    category,
    minPrice,
    maxPrice,
    shapes,
    sizes,
    fillings,
    toppings,
  } = req.body;
  if (
    !name ||
    !description ||
    !images ||
    !category ||
    !minPrice ||
    !maxPrice ||
    !shapes ||
    !sizes ||
    !fillings ||
    !toppings
  ) {
    return res.status(404).json({
      error: true,
      message: "Please fill out all fields",
    });
  }

  try {
    const categoryDetails = await Category.create({
      name,
      description,
      images,
      category,
      minPrice,
      maxPrice,
      shapes,
      sizes,
      fillings,
      toppings,
    });

    return res.status(200).json({
      error: false,
      categoryDetails,
      message: "Category Created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      eroor: true,
      err,
      message: "Internal server error",
    });
  }
};

const editCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const {
    name,
    description,
    images,
    category,
    minPrice,
    maxPrice,
    shapes,
    sizes,
    fillings,
    toppings,
  } = req.body;

  try {
    const categoryDetails = await Category.findOne({ _id: categoryId });
    if (!categoryDetails) {
      return res.status(400).json({
        error: true,
        message: "category not found",
      });
    }

    if (name) categoryDetails.name = name;
    if (description) categoryDetails.description = description;
    if (images) categoryDetails.images = images;
    if (category) categoryDetails.category = category;
    if (minPrice) categoryDetails.minPrice = minPrice;
    if (maxPrice) categoryDetails.maxPrice = maxPrice;
    if (shapes) categoryDetails.shapes = shapes;
    if (sizes) categoryDetails.sizes = sizes;
    if (fillings) categoryDetails.fillings = fillings;
    if (toppings) categoryDetails.toppings = toppings;

    await categoryDetails.save();
    res.json({
      error: false,
      categoryDetails,
      message: "Category updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      err,
      message: "Internal server Error",
    });
  }
};

const getCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const categoryDetails = await Category.findOne({ _id: categoryId });
    if (!categoryDetails) {
      return res.status(400).json({
        error: true,
        message: "category not found",
      });
    }

    return res.json({
      error: false,
      categoryDetails,
      message: "Category Retrieved succcessfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};
const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categoryDetails = await Category.find();

    return res.json({
      error: false,
      categoryDetails,
      message: "All Categories Retrieved succcessfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  try {
    const categoryDetails = await Category.deleteOne({ _id: categoryId });
    if (!categoryDetails) {
      return res.status(400).json({
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
  deleteCategory,
  getAllCategories,
  getCategory,
};
