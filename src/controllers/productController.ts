import { Request, Response } from "express";
import Product from "../models/Product.model";
import Category from "../models/Category.model";
import SubCategory from "../models/SubCategory.model";
import mongoose from "mongoose";

// const createProduct = async (req: Request, res: Response) => {
//   const {
//     category,
//     flavour,
//     description,
//     images,
//     maxPrice,
//     minPrice,
//     name,
//     productType,
//     shapes,
//     sizes,
//   subCategory,
//    toppings,
//    status
// } = req.body;

//   if (
//     !category||
//     !flavour||
//     !description||
//     !images||
//     !maxPrice||
//     !minPrice||
//     !name||
//     !productType||
//     !shapes||
//     !sizes||
//   !subCategory||
//    !toppings|| !status
//   ) {
//     return res.status(404).json({
//       error: true,
//       message: "Please fill out all fields",
//     });
//   }

//   const productCode = generateUniqueId()
//   try {
//     const productDetails = await Product.create({
//       category,
//       flavour,
//       description,
//       images,
//       maxPrice,
//       minPrice,
//       name,
//       productType,
//       shapes,
//       sizes,
//     subCategory,
//      toppings,
//      status,
//      productCode
//     });

//     return res.status(200).json({
//       error: false,
//       productDetails,
//       message: "Product Created successfully",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       error: true,
//       err,
//       message: "Internal server error",
//     });
//   }
// };
 const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      shapes,
      sizes,
      productType,
      toppings,
      category,
      subCategories,
      minPrice,
      maxPrice,
      images,
      flavour,
      status
    } = req.body;

    if (!name || !description || !category || !subCategories || !minPrice || !maxPrice || !status) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check if category ID is valid
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID format." });
    }

    // Convert and validate subCategory IDs
    const subCategoryIds = (subCategories as string[]).map((id: string) => 
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
    ).filter((id): id is mongoose.Types.ObjectId => id !== null);
    
    if (subCategoryIds.length !== subCategories.length) {
      return res.status(400).json({ message: "One or more subcategories have an invalid ID format." });
    }

    // Check if category exists
    const existingCategory = await Category.findOne({_id: category});
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Check if subCategories exist
    const existingSubCategories = await SubCategory.find({ _id: { $in: subCategoryIds } });
    if (existingSubCategories.length !== subCategories.length) {
      return res.status(400).json({ message: "One or more subcategories do not exist." });
    }

    // Ensure subCategories belong to the specified category
    const invalidSubCategories = existingSubCategories.filter(
      (subCategory) => subCategory.categoryId.toString() !== category
    );

    if (invalidSubCategories.length > 0) {
      return res.status(400).json({ message: "Some subcategories do not belong to the provided category." });
    }

    // Create new product
    const newProduct = new Product({
      name,
      description,
      shapes,
      sizes,
      productType,
      toppings,
      category,
      subCategories: subCategoryIds,
      minPrice,
      maxPrice,
      images,
      flavour,
      status,
      productCode: generateUniqueId(),
    });

    // Save product to database
    await newProduct.save();

    return res.status(201).json({ message: "Product created successfully", product: newProduct });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const generatedIds = new Set(); // Store unique IDs

function generateUniqueId() {
  const prefix = "GOL";
  let uniqueId;

  do {
    const randomNumbers = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
    uniqueId = `${prefix}${randomNumbers}`;
  } while (generatedIds.has(uniqueId)); // Ensure the ID is not already in the set

  generatedIds.add(uniqueId); // Add the new unique ID to the set
  return uniqueId;
}

const editProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const {
    name,
    description,
    shapes,
    sizes,
    productType,
    toppings,
    category,
    subCategories,
    minPrice,
    maxPrice,
    images,
    flavour,
    status
  } = req.body;

  try {
    const productDetails = await Product.findOne({ _id: productId });
    if (!productDetails) {
      return res.status(400).json({
        error: true,
        message: "product not found",
      });
    }

    if (name) productDetails.name = name;
    if (description) productDetails.description = description;
    if (shapes) productDetails.shapes = shapes;
    if (sizes) productDetails.sizes = sizes;
    if (productType) productDetails.productType = productType;
    if (toppings) productDetails.toppings = toppings;
    if (category) productDetails.category = category;
    if (subCategories) productDetails.subCategories = subCategories;
    if (minPrice) productDetails.minPrice = minPrice;
    if (maxPrice) productDetails.maxPrice = maxPrice;
    if (images) productDetails.images = images;
    if (flavour) productDetails.flavour = flavour;
    if (status) productDetails.status = status ;

    await productDetails.save();
    res.json({
      error: false,
      productDetails,
      message: "Product updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      err,
      message: "Internal server Error",
    });
  }
};
const getProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productDetails = await Product.findOne({ _id: productId }).populate('category').populate('subCategories');
    if (!productDetails) {
      return res.status(400).json({
        error: true,
        message: "product not found",
      });
    }

    return res.json({
      error: false,
      productDetails,
      message: "Product Retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      subCategoryIds,
      categoryIds,
      minPrice,
      maxPrice,
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = "createdAt", // Default sorting by createdAt
      order = "desc", // Default order is descending
    } = req.query;

    const filters: any = {};

    if (categoryIds) {
      filters["category.id"] = { $in: (categoryIds as string).split(",") };
    }

    if (subCategoryIds) {
      filters["subCategory.id"] = {
        $in: (subCategoryIds as string).split(","),
      };
    }

    if (minPrice || maxPrice) {
      filters.minPrice = {};
      if (minPrice) filters.minPrice.$gte = parseFloat(minPrice as string);
      if (maxPrice) filters.minPrice.$lte = parseFloat(maxPrice as string);
    }

    if (searchQuery && (searchQuery as string).trim() !== "") {
      filters.$or = [
        { name: { $regex: searchQuery as string, $options: "i" } },
        { description: { $regex: searchQuery as string, $options: "i" } },
        { productCode: { $regex: searchQuery as string, $options: "i" } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Ensure `sortBy` is a valid string and cast it
    const validSortBy = typeof sortBy === 'string' ? sortBy : 'createdAt'; // Fallback to 'createdAt' if invalid
    const sortOrder = order === "asc" ? 1 : -1;

    // Apply sorting
    const productDetails = await Product.find(filters).populate('category').populate('subCategories')
      .sort({ [validSortBy]: sortOrder }) // Sort by the specified field and order
      .skip(skip)
      .limit(parseInt(limit as string))
      .exec();

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / parseInt(limit as string));

    return res.status(200).json({
      error: false,
      products: productDetails,
      totalPages,
      currentPage: parseInt(page as string),
      totalProducts,
      message: "Products retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const productDetails = await Product.deleteOne({ _id: productId });
    if (!productDetails) {
      return res.status(404).json({
        error: true,
        message: "product not found",
      });
    }
    return res.json({
      error: false,
      message: "product deleted successfully",
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
  createProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
};
