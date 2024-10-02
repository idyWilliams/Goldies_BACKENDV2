import { Request, Response } from "express";
import SubCategory from "../models/SubCategory.model";
import Category from "../models/Category.model";

// Create SubCategories
const createSubCategory = async (req: Request, res: Response) => {
  const { name, description, image, status, categoryId } = req.body;

  try {

    const category = await Category.findOne({ _id: categoryId})

    if(!category) return res.status(404).json({
      error: true,
      message: "Wrong category id provided"
    })
    
    const subCategory = await SubCategory.create({
      name,
      description,
      image,
      status,
      categoryId
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
      message: "Internal server error, Please try again",
    });
  }
};

// Update subCategory
const updateSubCategory = async (req: Request, res: Response) => {
  const { subCategoryId } = req.params;
  const { name, description, image, status } = req.body;
  try {
    const subCategory = await SubCategory.findOne({ _id: subCategoryId });

    if (!subCategory) {
      return res.status(200).json({
        error: true,
        message: "subCategory not found, please try again with the correct ID",
      });
    }

    if (name) subCategory.name = name;
    if (description) subCategory.description = description;
    if (image) subCategory.image = image;
    subCategory.status = status;

    await subCategory.save();

    return res.status(200).json({
      error: false,
      subCategory,
      message: "SubCategory updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error, Please try again",
    });
  }
};

// Get all subCategories with pagination
const getAllSubCategory = async (req: Request, res: Response) => {
  try {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const totalSubCategories = await SubCategory.countDocuments();

    // Get paginated subcategories
    const subCategories = await SubCategory.find().skip(skip).limit(limit).lean();


    res.status(200).json({
      error: false,
      subCategories,
      totalPages: Math.ceil(totalSubCategories / limit), 
      currentPage: page,
      totalSubCategories,
      message: "All subcategories fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error, please try again",
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
      error: false,
      subCategory,
      message: "subCategory data fetched successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal server error, Please try again",
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
      message: "Subcategory deleted successfully",
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
  deleteSubCategory,
};
