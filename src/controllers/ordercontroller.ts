import { Request, Response } from "express"
import Order from "../models/Order.model";
import User from "../models/User.model";

import { CustomRequest } from "../middleware/verifyJWT";
const createOrder = async (req: CustomRequest, res: Response) => {
    const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, orderedItems, fee } = req.body;

    try{
        if (!firstName || !lastName || !email || !country || !cityOrTown || !streetAddress || !phoneNumber || !orderedItems || !fee) {
            return res.status(400).json({
                error: true,
                message: "All order information fields are required."
            });
        }

        const user = req.id;
        const userDetails = await User.findOne({ _id: user })

        if(!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please login and try again"
            })
        }
        const newOrder = new Order({
            user,
            firstName, 
            lastName,
            email,
            country,
            cityOrTown,
            streetAddress,
            phoneNumber,
            orderedItems,
            fee,
        });

    await newOrder.save();

    return res.status(201).json({
        error: false,
      message: "Order created successfully",
      order: newOrder,
    });

    } catch(error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

const updateOrderStatus = async (req: Request, res: Response) => {
    const { orderStatus } = req.body;
    const { orderId } = req.params

    try{
        const order = await Order.findOne({ _id: orderId })
        if(!order){
            return res.status(404).json({
                error: true,
                message: "Order details not found, please provide the correct order id"
            })
        }

        if (orderStatus) order.orderStatus = orderStatus
        await order.save()

        return res.status(200).json({
            error: false,
            updatedOrder: order,
            message: "Order updated successfully"
        })


    } catch(error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()

        return res.status(200).json({
            error: false,
            orders,
            message: "All order data fetched successfully"
        })
    } catch(error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

const getOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params

    try {
        const order = await Order.findOne({ _id: orderId })

        if(!order){
            return res.status(404).json({
                error: true,
                message: "Order not found, Please provide the correct order id"
            })
        }
        return res.status(200).json({
            error: false,
            order,
            message: "Order details fetched successfully"
        })
    } catch(error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params
        const result = await Order.deleteOne({ _id: orderId })
        if(!result){
            return res.status(404).json({
                error: true,
                message: "Order not found, Please provide the correct order id"
            })
        }

        return res.status(200).json({
            error: false,
            message: "Order details deleted successfully"
        })
    } catch(error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

const getSpecificUserOrder = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.id
        const userOrder = await Order.find({ user })

        const userDetails = await User.findOne({ _id: user })

        if(!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please login and try again"
            })
        }

        if(!userOrder){
            return res.status(404).json({
                error: true,
                message: "No order found for this user"
            })
        }

        return res.status(200).json({
            error: false,
            userOrder,
            message: `${userDetails.firstName} ${userDetails.lastName} orders retrieved successfully`
        })
    } catch(error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

export { createOrder, updateOrderStatus, getAllOrders, getOrder, deleteOrder, getSpecificUserOrder }
