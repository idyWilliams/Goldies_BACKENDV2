import Category, { categorySchemaI } from "../models/Category.model";
import { Request, Response } from "express";
import SubCategory, { subCategorySchemaI } from "../models/SubCategory.model";

//  create category
const createCategory = async (req: Request, res: Response) => {
  const { name, description, image, categorySlug, status } = req.body;

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

  if (!image)
    return res.status(200).json({
      error: true,
      message: "Please provide category images",
    });

  try {
    const category = await Category.create({
      name,
      description,
      image,
      categorySlug,
      status
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
      message: "Internal server error, Please try again",
    });
  }
};

// update category
const editCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  const { name, description, image, categorySlug, status } = req.body;
  try {
    const categoryDetails = await Category.findOne({ _id: categoryId });

    if (!categoryDetails)
      return res.status(404).json({
        error: true,
        message: "category not found",
      });

    if (name) categoryDetails.name = name;
    if (description) categoryDetails.description = description;
    if (image) categoryDetails.image = image;
    if (categorySlug) categoryDetails.categorySlug = categorySlug;
    categoryDetails.status = status;

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
    // Fetch all categories and subcategories
    const allCategories = await Category.find().lean(); // Use `.lean()` to get plain objects
    const allSubCategories = await SubCategory.find().lean();

    // Attach subcategories to their respective categories
    const categoriesWithSubcategories = allCategories.map((category) => {
      const subCategories = allSubCategories.filter(
        (subCategory) => subCategory.categoryId.toString() === category._id.toString()
      );

      return {
        ...category,
        subCategories,
      };
    });

    res.status(200).json({
      error: false,
      categories: categoriesWithSubcategories,
      message: "All categories retrieved successfully",
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
    // Find the category by ID
    const category = await Category.findById(categoryId).lean(); // Use `.lean()` to get a plain JavaScript object

    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    // Find all subcategories associated with this category
    const subCategories = await SubCategory.find({ categoryId: category._id }).lean();

    // Combine category data with its subcategories
    const categoryWithSubcategories = {
      ...category,
      subCategories,
    };

    res.status(200).json({
      error: false,
      category: categoryWithSubcategories,
      message: "Category fetched successfully",
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
