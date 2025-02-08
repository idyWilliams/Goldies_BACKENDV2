import { CustomRequest } from "../middleware/verifyJWT";
import { Response } from "express";
import Product from "../models/Product.model";
import User from "../models/User.model";
import mongoose from "mongoose";

const addFavorite = async (req: CustomRequest, res: Response)=> {
   const { productId } = req.body;
   const user = req.id;
   
   try{

    
    // if (!mongoose.Types.ObjectId.isValid(productId)) {
    //   return res.status(400).json({
    //     error: true,
    //     message: "Invalid Product ID format.",
    //   });
    // }

    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again."
      })
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }



    if (userDetails.favorites.includes(productId)){
        return res.status(400).json({
            error: false,
            message: "Products already in favorites"
        });
    }

    userDetails.favorites.push(productId)
    await userDetails.save();

    await userDetails.populate('favorites');

    return res.status(200).json({
        error: false,
        message: 'Product added to favorites',
        favorites: userDetails.favorites
    })


   }catch(error){
    console.error("Error adding favorites", error);
    return res.status(500).json({
        error: true,
        err: error,
        message: "Internal server error, please try again"
    });
   }
}

const removeFavorite = async (req: CustomRequest, res: Response) => {
    const { productId } = req.params;
    const user = req.id;
    
    try{
     const userDetails = await User.findOne({ _id: user });
 
     if (!userDetails) {
       return res.status(404).json({
         error: true,
         message: "User not found, please log in and try again."
       })
     }
 
     const product = await Product.findOne({ _id: productId })
     if(!product){
         return res.status(404).json({
             error: true,
             message: "Product not found"
         })
     }

     userDetails.favorites = userDetails.favorites.filter((id) => id.toString() !== productId);
     await userDetails.save();
     await userDetails.populate('favorites');

     return res.status(200).json({
        error: false,
        message: "Product removed from favorites successfully",
        favorites: userDetails.favorites
     })
    }catch(error){
        console.error("Error removing favorite", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
       }
}

const getFavorites = async (req: CustomRequest, res: Response) => {
    const user = req.id;
    try{
     const userDetails = await User.findOne({ _id: user }).populate('favorites');
 
     if (!userDetails) {
       return res.status(404).json({
         error: true,
         message: "User not found, please log in and try again."
       })
     }

     return res.status(200).json({
        error: false,
        favorites: userDetails.favorites
     })
    }catch(error){
        console.error("Error fetching favorite", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
       }
}



export { addFavorite, removeFavorite, getFavorites }