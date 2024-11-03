import { Response } from "express";
import User from "../models/User.model";
import Admin from "../models/Admin.model";

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

const getAllUSers = async (req: CustomRequest, res: Response) => {
  const id  = req.id

  try{
    const admin = await Admin.findOne({ _id: id });

    if(!admin) return res.status(404).json({
      error: true,
      message: "admin not found, Please login as an admin"
    })

    const users = await User.find()

    return res.status(200).json({
      error: false,
      users,
      message: "All user details retrieved successfully"
    })
   } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
  }
}

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

    // If the new billing info is marked as default, set all others to false
    if (defaultBillingInfo) {
      userDetails.billingInfo.forEach(info => {
        info.defaultBillingInfo = false;
      });
    }

    // Add new billing info
    userDetails.billingInfo.push({
      firstName,
      lastName,
      email,
      country,
      cityOrTown,
      streetAddress,
      phoneNumber,
      defaultBillingInfo: defaultBillingInfo || false, // Set default if not provided
    });

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
    });
  }
};

const updateBillingInfo = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, country, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
  const { billingId } = req.params;
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again.",
      });
    }

    // Ensure billingInfo is initialized as an array
    if (!userDetails.billingInfo) {
      return res.status(400).json({
        error: true,
        message: "Billing information is not available.",
      });
    }

    // Find the billing info to be updated
    const billingDoc = userDetails.billingInfo.find((info) => info._id?.toString() === billingId);

    if (!billingDoc) {
      return res.status(404).json({
        error: true,
        message: "Billing information not found.",
      });
    }

    // If updating to default, set all other defaultBillingInfo to false
    if (defaultBillingInfo) {
      userDetails.billingInfo.forEach((info) => {
        if (info._id?.toString() !== billingId) {
          info.defaultBillingInfo = false;
        }
      });
    }

    // Update the specific billing info
    if (billingDoc) {
      billingDoc.firstName = firstName;
      billingDoc.lastName = lastName;
      billingDoc.email = email;
      billingDoc.country = country;
      billingDoc.cityOrTown = cityOrTown;
      billingDoc.streetAddress = streetAddress;
      billingDoc.phoneNumber = phoneNumber;
      billingDoc.defaultBillingInfo = defaultBillingInfo || billingDoc.defaultBillingInfo;
    }

    // Save updated user details
    await userDetails.save();

    return res.status(200).json({
      error: false,
      user: userDetails.toObject(),
      message: "Billing info updated successfully.",
    });
  } catch (error) {
    console.error("Error updating billing info:", error);
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
  }
};


const deleteBillingInfo = async (req: CustomRequest, res: Response) => {
  const { billingId } = req.params;
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again.",
      });
    }

    // Ensure billingInfo is initialized as an array
    if (!userDetails.billingInfo || !Array.isArray(userDetails.billingInfo)) {
      return res.status(400).json({
        error: true,
        message: "Billing information is not available.",
      });
    }

    // Find the index of the billing info to be removed
    const billingIndex = userDetails.billingInfo.findIndex((info) => info._id?.toString() === billingId);

    if (billingIndex === -1) {
      return res.status(404).json({
        error: true,
        message: "Billing information not found.",
      });
    }

    // Remove the billing info from the array
    userDetails.billingInfo.splice(billingIndex, 1);

    await userDetails.save();

    return res.status(200).json({
      error: false,
      message: "Billing info deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting billing info:", error);
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
  }
};

const updateDefaultBillingInfo = async (req: CustomRequest, res: Response) => {
  const { billingId } = req.params;
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again.",
      });
    }

    // Ensure billingInfo is initialized
    if (!userDetails.billingInfo) {
      return res.status(400).json({
        error: true,
        message: "Billing information is not available.",
      });
    }

    // Update billingInfo entries
    userDetails.billingInfo.forEach((info) => {
      if (info._id?.toString() === billingId) {
        info.defaultBillingInfo = true;
      } else {
        info.defaultBillingInfo = false;
      }
    });

    // Save updated user details
    await userDetails.save();

    return res.status(200).json({
      error: false,
      message: "Default billing info updated successfully.",
    });
  } catch (error) {
    console.error("Error updating default billing info:", error);
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
  }
};

const updateProfile = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    if (email){
      const emailExist = await User.findOne({ email: email})
      if(emailExist){
        return res.status(404).json({
          error: true,
          message: 'Email already in use'
        })
      }
    }

    if (firstName) userDetails.firstName = firstName;
    if (lastName) userDetails.lastName = lastName;
    if (email) userDetails.email = email;
    if (phoneNumber) userDetails.phoneNumber = phoneNumber;

    
    await userDetails.save();

    return res.status(200).json({
      error: false,
      message: "Profile updated successfully.",
    });
  }catch (error) {
  console.error("Error updating profile:", error);
  return res.status(500).json({
    error: true,
    err: error,
    message: "Internal server error, please try again",
  });

}}

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

export { saveBillingInfo, getUser, updateBillingInfo, deleteBillingInfo, updateDefaultBillingInfo, getAllUSers, updateProfile };
