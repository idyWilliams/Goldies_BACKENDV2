import { Request, Response } from "express"
import Order from "../models/Order.model";

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
            fee
        });

    await newOrder.save();

    return res.status(201).json({
        error: false,
      message: "Order created successfully",
      order: newOrder,
    });

    } catch(error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        })
    }
}

export { createOrder }