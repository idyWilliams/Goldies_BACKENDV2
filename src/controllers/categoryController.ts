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
