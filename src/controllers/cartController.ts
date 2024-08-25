import {Request, Response} from "express"
import Cart from "../models/Cart.model"

const addToCart = async (req: Request, res: Response) => {
    const {size, toppings, dateNeeded, details, quantity} = req.body

    try {
        if (!size) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake size is needed"
            })
        }
        if (!toppings) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake toppings is needed"
            })
        }
        if (!dateNeeded) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, Let know when the cake is needed"
            })
        }
        if (!details) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake details is needed"
            })
        }
        if (!quantity) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake quantity is needed"
            })
        }

        const cart = await Cart.create({size, toppings, details, quantity, dateNeeded})

        return res.status(201).json({
            error: false,
            cart,
            message: "Added to cart successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, Please try again"
        })
    }
}

const deleteCart = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const cart = await Cart.deleteOne({ _id: id })
        if(!cart){
            return res.status(404).json({
                error: true,
                message: "Cart item not found, please provide the correct id"
            })
        }

        return res.status(200).json({
            error: false,
            message: "Cart item deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, Please try again"
        })
    }
}


export {addToCart, deleteCart}