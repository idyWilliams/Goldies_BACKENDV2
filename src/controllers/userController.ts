import { Response } from "express";
import User from "../models/User.model";

import { CustomRequest } from "../middleware/verifyJWT";
const getUser = async (req: CustomRequest, res: Response) => {
  const user = req.id;

  try {
    const isUser = await User.findOne({ _id: user });

    if (!isUser) {
      return res.sendStatus(401);
    }

    // Convert the Mongoose document to a plain object
    const userObject = isUser.toObject();

    // Destructure to remove the password
    const { password, ...rest } = userObject;

    return res.json({
      user: rest,
      message: "This is from the backend just now",
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
        error: true,
        err: error,
        message: "Internal server error, please try again"
    })
  }

};

const saveBillingInfo = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
  const user = req.id;

  if (!firstName || !lastName || !email || !country || !cityOrTown || !streetAddress || !phoneNumber) {
    return res.status(400).json({
      error: true,
      message: "All billing information fields are required."
    });
  }

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again."
      });
    }

    // Create or update billing info
    userDetails.billingInfo = {
      firstName,
      lastName,
      email,
      country,
      cityOrTown,
      streetAddress,
      phoneNumber,
      defaultBillingInfo: defaultBillingInfo || false, // Set default if not provided
    };

    // Save user with the updated billing info
    await userDetails.save();

    const userObject = userDetails.toObject();

    const { password, ...rest } = userObject;

    return res.status(200).json({
      error: false,
      user: rest,
      message: "Billing info saved successfully."
    });
  } catch (error) {
    console.error("Error saving billing info:", error);
    return res.status(500).json({
        error: true,
        err: error,
        message: "Internal server error, please try again"
    })
  }
};



// const saveBillingInfo = async (req: CustomRequest, res: Response) => {
//     const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body
//     const user  = req.id
//     const userDetails = await User.findOne({ _id: user });

//     if(!userDetails) {
//       return res.status(404).json({
//         error: true,
//         message: "User not found, Please login and try again"
//       })
//     }

//     try {
//       if(userDetails.billingInfo) {
//         userDetails.billingInfo.firstName = firstName
//         userDetails.billingInfo.lastName = lastName
//         userDetails.billingInfo.email = email
//         userDetails.billingInfo.country = country
//         userDetails.billingInfo.cityOrTown = cityOrTown
//         userDetails.billingInfo.streetAddress = streetAddress
//         userDetails.billingInfo.phoneNumber = phoneNumber
//         userDetails.billingInfo.defaultBillingInfo = defaultBillingInfo
//       }

//         await userDetails.save();
//         return res.status(200).json({
//             error: false,
//             userDetails,
//             message: "Billing info created successfully"
//         })
//     } catch (error) {
//         return res.status(500).json({
//             error: true,
//             err: error,
//             message: "Internal server error, please try again"
//         })
//     }
// }

export {saveBillingInfo, getUser};
