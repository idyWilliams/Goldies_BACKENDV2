import {Request, Response} from "express"
import Cart from "../models/Cart.model"
import { CustomRequest } from "../middleware/verifyJWT";
import Product from "../models/Product.model";


const addToCart = async (req: CustomRequest, res: Response) => {
  try {
    const { productId, size, toppings, flavour, dateNeeded, details, quantity } = req.body;
    const userId = req.id; 

    if (!userId) {
      return res.status(401).json({ error: true, message: "Unauthorized. Please log in." });
    }



    // Check if the product exists
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: true, message: "Product not found." });
    }

    // Validate required fields
    if (!size || !toppings || !flavour || !dateNeeded || !details || !quantity) {
      return res.status(400).json({ error: true, message: "All fields are required." });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if user has no cart yet
      cart = new Cart({
        userId,
        products: [{ productId, size, toppings, flavour, dateNeeded, details, quantity }],
      });
    } else {
      // Check if the product already exists in the cart
      const existingProduct = cart.products.find((p) => p.productId.toString() === productId);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ productId, size, toppings, flavour, dateNeeded, details, quantity });
      }
    }

    await cart.save();

    return res.status(200).json({
      error: false,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ error: true, message: "Internal server error.", err: error });
  }
};

 const updateCartItem = async (req: CustomRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.id;

    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized." });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: true, message: "Cart not found." });

    const product = cart.products.find((p) => p.productId.toString() === productId);
    if (!product) return res.status(404).json({ error: true, message: "Product not found in cart." });

    product.quantity = quantity;
    await cart.save();

    return res.status(200).json({ error: false, message: "Cart updated successfully.", cart });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error.", err: error });
  }
};

const removeCartItem = async (req: CustomRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.id;

    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized." });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: true, message: "Cart not found." });

    cart.products = cart.products.filter((p) => p.productId.toString() !== productId);
    await cart.save();

    return res.status(200).json({ error: false, message: "Product removed from cart.", cart });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error.", err: error });
  }
};
 const clearCart = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized." });

    await Cart.findOneAndDelete({ userId });

    return res.status(200).json({ error: false, message: "Cart cleared successfully." });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error.", err: error });
  }
};

 const getCart = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized." });

    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) return res.status(404).json({ error: true, message: "Cart is empty." });

    return res.status(200).json({ error: false, cart });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error.", err: error });
  }
};



export {addToCart, updateCartItem, removeCartItem, clearCart, getCart}