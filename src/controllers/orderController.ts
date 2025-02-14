import { Request, Response } from "express"
import Order from "../models/Order.model";
import User from "../models/User.model";

import { CustomRequest } from "../middleware/verifyJWT";
import mongoose from "mongoose";
const createOrder = async (req: CustomRequest, res: Response) => {
    const { firstName, lastName, email, country, state, cityOrTown, streetAddress, phoneNumber, orderedItems, fee } = req.body;

    try{
        if (!firstName || !lastName || !email || !country || !state || !cityOrTown || !streetAddress || !phoneNumber || !orderedItems || !fee) {
            return res.status(400).json({
                error: true,
                message: "All order information fields are required."
            });
        }

        console.log("User ID from token:", req.id);

        const user = req.id;
        const userDetails = await User.findOne({ _id: user })
    

        const orderId = generateUniqueId()
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
            state,
            cityOrTown,
            streetAddress,
            phoneNumber,
            orderedItems,
            fee,
            orderId
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
const updateOrderStatus = async (req: Request, res: Response) => {
    const { orderStatus } = req.body;
    const { orderId } = req.params

    try{
     const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);

  const queryConditions = isValidObjectId
    ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
    : [{ orderId: orderId }]; // Match only orderId

  const order = await Order.findOne({ $or: queryConditions });
          
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
        const orders = await Order.find().sort({ createdAt: -1 })

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
        const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);

  const queryConditions = isValidObjectId
    ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
    : [{ orderId: orderId }]; // Match only orderId

  const order = await Order.findOne({ $or: queryConditions });

          
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
             const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);

  const queryConditions = isValidObjectId
    ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
    : [{ orderId: orderId }]; // Match only orderId

  const result = await Order.deleteOne({ $or: queryConditions });
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
        const userOrder = await Order.find({ user }).sort({ createdAt: -1 })

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
