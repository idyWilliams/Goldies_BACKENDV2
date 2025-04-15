import { Request, Response } from "express"
import Order from "../models/Order.model";
import User from "../models/User.model";
import nodemailer from "nodemailer";

import { CustomRequest } from "../middleware/verifyJWT";
import mongoose from "mongoose";
import Cart from "../models/Cart.model";


// const createOrder = async (req: CustomRequest, res: Response) => {
//     const { firstName, lastName, email, country, state, cityOrTown, streetAddress, phoneNumber, orderedItems, fee } = req.body;
  
//     try {
//       // Validate required fields
//       if (!firstName || !lastName || !email || !country || !state || !cityOrTown || !streetAddress || !phoneNumber || !orderedItems || !fee) {
//         return res.status(400).json({
//           error: true,
//           message: "All order information fields are required."
//         });
//       }
  
//       console.log("User ID from token:", req.id);
  
//       const user = req.id;
//       const userDetails = await User.findOne({ _id: user });
//       if (!userDetails) {
//         return res.status(404).json({
//           error: true,
//           message: "User not found, please login and try again"
//         });
//       }
  
  
//       // Generate a unique order ID
//       const orderId = generateUniqueId();
  
//       // Create the order, storing only product._id and other fields separately
//       const newOrder = new Order({
//         user,
//         firstName,
//         lastName,
//         email,
//         country,
//         state,
//         cityOrTown,
//         streetAddress,
//         phoneNumber,
//         orderedItems,
//         fee,
//         orderId
//       });
  
//       // Save the order
//       await newOrder.save();
  
  
//       // Populate orderedItems with full product details after saving
//       const populatedOrder = await Order.findById(newOrder._id).populate("orderedItems.product").exec();

//       const transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 465,
//         secure: true,
//         auth: {
//           user: process.env.EMAIL,
//           pass: process.env.PASSWORD,
//         },
//         tls: {
//           rejectUnauthorized: false,
//         },
//       });
  
//       // Function to send the verification email
//       const sendVerificationEmail = async () => {
//         const emailContent = `
//         <div style="font-family: Arial, sans-serif; color: #333;">
//           <h2 style="color: #007bff;">Email Verification</h2>
//           <p>Do not share this with anyone.</p>
//           <p>Verification code: <strong>${OTP}</strong></p>
//           <p>If you did not request this, please ignore this email.</p>
//         </div>
//       `;
  
//         const mailOptions = {
//           from: process.env.EMAIL,
//           to: email,
//           subject: "Goldies Team - Email Verification",
//           text: "Email verification.",
//           html: emailContent,
//         };
  
//         try {
//           const info = await transporter.sendMail(mailOptions);
//           console.log("Message sent: %s", info.messageId, OTP);
//         } catch (err) {
//           console.error("Error sending email: ", err);
//           throw new Error("Failed to send verification email.");
//         }
//       };
  
  
//       return res.status(201).json({
//         error: false,
//         message: "Order created successfully",
//         order: populatedOrder,
//       });
  
//     } catch (error) {
//       console.error("Error creating order:", error);
//       return res.status(500).json({
//         error: true,
//         message: "Internal server error, please try again",
//         err: error,
//       });
//     }
//   };

const createOrder = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, country, state, cityOrTown, streetAddress, phoneNumber, orderedItems, fee } = req.body;

  try {
      // Validate required fields
      if (!firstName || !lastName || !email || !country || !state || !cityOrTown || !streetAddress || !phoneNumber || !orderedItems || !fee) {
          return res.status(400).json({
              error: true,
              message: "All order information fields are required."
          });
      }

      const user = req.id;
      const userDetails = await User.findOne({ _id: user });
      if (!userDetails) {
          return res.status(404).json({
              error: true,
              message: "User not found, please login and try again"
          });
      }

      // Generate a unique order ID
      const orderId = generateUniqueId();

      // Create the order
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

      // Save the order
      await newOrder.save();

      // Populate orderedItems with full product details
      const populatedOrder = await Order.findById(newOrder._id).populate("orderedItems.product").exec();

      // Create email transporter
      const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
          },
          tls: {
              rejectUnauthorized: false,
          },
      });

      // Function to send email to admins
      const sendAdminNotification = async () => {
          try {
              // Get admin emails
              const admins = await User.find({
                  role: { $in: ['admin', 'super_admin'] },
                  isActive: true
              }).select('email');

              if (admins.length === 0) {
                  console.warn("No admin emails found to notify");
                  return;
              }

              const adminEmails = admins.map(admin => admin.email).join(', ');

              const emailContent = `
                  <div style="font-family: Arial, sans-serif; color: #333;">
                      <h2 style="color: #007bff;">New Order Notification</h2>
                      <p>A new order has been placed on your platform.</p>
                      <h3>Order Details:</h3>
                      <p><strong>Order ID:</strong> ${orderId}</p>
                      <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
                      <p><strong>Email:</strong> ${email}</p>
                      <p><strong>Total Items:</strong> ${orderedItems.length}</p>
                      <p><strong>Total Fee:</strong> ${fee}</p>
                      <p>Please log in to the admin dashboard to view and process this order.</p>
                  </div>
              `;

              const mailOptions = {
                  from: process.env.EMAIL,
                  to: adminEmails,
                  subject: `New Order #${orderId} - ${firstName} ${lastName}`,
                  html: emailContent,
              };

              await transporter.sendMail(mailOptions);
              console.log("Admin notification sent for order:", orderId);
          } catch (err) {
              console.error("Error sending admin notification:", err);
              // Don't fail the order creation if email fails
          }
      };

      // Send notification to admins (don't await to avoid delaying response)
      sendAdminNotification();

      return res.status(201).json({
          error: false,
          message: "Order created successfully",
          order: populatedOrder,
      });

  } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({
          error: true,
          message: "Internal server error, please try again",
      });
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

// const getAllOrders = async (req: Request, res: Response) => {
//     try {
//         const orders = await Order.find().sort({ createdAt: -1 })

//         return res.status(200).json({
//             error: false,
//             orders,
//             message: "All order data fetched successfully"
//         })
//     } catch(error) {
//         return res.status(500).json({
//             error: true,
//             err: error,
//             message: "Internal server error, please try again"
//         })
//     }
// }

const getAllOrders = async (req: Request, res: Response) => {
    const { page = 1, limit = 10, searchQuery = '', status, minPrice, maxPrice, startDate, endDate } = req.query;  
    try {
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
  
    
  
      const skip = (pageNumber - 1) * limitNumber;  // Calculate the number of records to skip
  
      // Build the filters object based on searchQuery
      const filters: any = {};
  
      // Search by orderId or billing name (firstName, lastName)
      if (searchQuery) {
        filters.$or = [
          { orderId: { $regex: searchQuery as string, $options: 'i' } },  
          { firstName: { $regex: searchQuery as string, $options: 'i' } },  
          { lastName: { $regex: searchQuery as string, $options: 'i' } }  
        ];
      }

          // Filter by status
    if (status) {
        filters.orderStatus = status;
      }
  
      // Filter by price range (assuming orders have a totalPrice field)
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice as string);
      }
  
      // Filter by date range (assuming orders have a `createdAt` field)
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate as string);
        if (endDate) filters.createdAt.$lte = new Date(endDate as string);
      }
  
  
      // Fetch the orders with pagination and search
      const orders = await Order.find(filters)
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })  // Sort by createdAt in descending order
        .populate('user', 'firstName lastName')
        .exec();
  
      // Get the total count of orders for pagination
      const totalOrders = await Order.countDocuments(filters);
      const totalPages = Math.ceil(totalOrders / limitNumber);
  
  
  
      return res.status(200).json({
        error: false,
        message: "All order data fetched successfully.",
        orders,
        totalPages,
        currentPage: pageNumber,
        totalOrders,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error, please try again.",
        err: error,
      });
    }
  };
  

const getOrder = async (req: Request, res: Response) => {
    const { orderId } = req.params

    try {
        const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);

  const queryConditions = isValidObjectId
    ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
    : [{ orderId: orderId }]; // Match only orderId

  const order = await Order.findOne({ $or: queryConditions }).populate('orderedItems.product')

          
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
      const userId = req.id; // Get the authenticated user's ID
      const { page = 1, limit = 10, status, startDate, endDate } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Base query always includes the user ID
      const query: any = { user: userId };

      // Add status filter if provided
      if (status) {
          query.orderStatus = status;
      }

      // Add date range filter if provided
      if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = new Date(startDate as string);
          if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      // Fetch user details
      const userDetails = await User.findById(userId);

      if (!userDetails) {
          return res.status(404).json({
              error: true,
              message: "User not found, please login and try again"
          });
      }

      // Fetch orders only for this user
      const userOrders = await Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

      const totalOrders = await Order.countDocuments(query);

      return res.status(200).json({
          error: false,
          userOrders,
          totalOrders,
          currentPage: Number(page),
          totalPages: Math.ceil(totalOrders / Number(limit)),
          message: `${userDetails.firstName} ${userDetails.lastName}'s orders retrieved successfully`
      });
  } catch (error) {
      return res.status(500).json({
          error: true,
          message: "Internal server error, please try again",
          details: error instanceof Error ? error.message : 'Unknown error'
      });
  }
};



export { createOrder, updateOrderStatus, getAllOrders, getOrder, deleteOrder, getSpecificUserOrder }
