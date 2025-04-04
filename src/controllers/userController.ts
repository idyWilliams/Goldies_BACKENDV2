import { Request, Response } from "express";
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

// const getAllUSers = async (req: CustomRequest, res: Response) => {
//   const id  = req.id

//   try{
//     const admin = await Admin.findOne({ _id: id });

//     if(!admin) return res.status(404).json({
//       error: true,
//       message: "admin not found, Please login as an admin"
//     })

//     const users = await User.find().select("-password");

//     return res.status(200).json({
//       error: false,
//       users,
//       message: "All user details retrieved successfully"
//     })
//    } catch (error) {
//     return res.status(500).json({
//       error: true,
//       err: error,
//       message: "Internal server error, please try again",
//     });
//   }
// }

const getAllUSers = async (req: CustomRequest, res: Response) => {
  const id = req.id;
  const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const admin = await Admin.findOne({ _id: id });

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: "admin not found, Please login as an admin",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;
    // Build the search query based on the search parameter
    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search as string, $options: 'i' } },  
          { lastName: { $regex: search as string, $options: 'i' } } , // Searching by name (case-insensitive)
            { email: { $regex: search as string, $options: 'i' } }, // Searching by email (case-insensitive)
          ],


         
        }
      : {};

    // Determine the sort field and order
    const sortField = sortBy === 'name' ? 'name' : sortBy === 'date' ? 'createdAt' : 'name';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Query users with pagination, search, and sorting
    const users = await User.find(searchQuery)
      .select('-password')
      .skip(skip) // Pagination
      .limit(limitNumber) // Limit
      .sort({ [sortField]: sortDirection }); // Sorting by field and direction

    // Get the total count for pagination metadata
    const totalUsers = await User.countDocuments(searchQuery);

    return res.status(200).json({
      error: false,
      users,
      totalUsers,
      message: "All user details retrieved successfully",
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
  }
};



const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userDetails = await User.findOne({ _id: userId }).select("-password");
    if (!userDetails) {
      return res.status(400).json({
        error: true,
        message: "user not found",
      });
    }

    return res.json({
      error: false,
      userDetails,
      message: "User Retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
}

const saveBillingInfo = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, country,  state, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
  const user = req.id;

  if (!firstName || !lastName || !email || !country || !state || !cityOrTown || !streetAddress || !phoneNumber) {
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
      state,
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

const getBillingInfo = async (req: CustomRequest, res: Response) => {
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again."
      });
    }

   const billingInfo = userDetails.billingInfo;

    return res.status(200).json({
      error: false,
      user: billingInfo,
      message: "Billing info fetched successfully."
    });
  } catch (error) {
    console.error("Error getting billing info:", error);
    return res.status(500).json({
        error: true,
        err: error,
        message: "Internal server error, please try again"
    });
  }
};


const updateBillingInfo = async (req: CustomRequest, res: Response) => {
  const { firstName, lastName, email, country, state, cityOrTown, streetAddress, phoneNumber, defaultBillingInfo } = req.body;
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
     if(firstName) billingDoc.firstName = firstName;
      if(lastName) billingDoc.lastName = lastName;
      if(email) billingDoc.email = email;
      if(country) billingDoc.country = country;
      if(state) billingDoc.state = state;
      if(cityOrTown) billingDoc.cityOrTown = cityOrTown;
      if(streetAddress) billingDoc.streetAddress = streetAddress;
      if(phoneNumber) billingDoc.phoneNumber = phoneNumber;
      if(defaultBillingInfo) billingDoc.defaultBillingInfo = defaultBillingInfo || billingDoc.defaultBillingInfo;
    }


    // Save updated user details
    await userDetails.save();
     const userObject = userDetails.toObject();
    const { password, ...rest } = userObject;

    return res.status(200).json({
      error: false,
      user: rest,
      message: "Billing info saved successfully."
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
  const { firstName, lastName, phone } = req.body;
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    if (firstName) userDetails.firstName = firstName;
    if (lastName) userDetails.lastName = lastName;
    if (phone) userDetails.phoneNumber = phone;
   
    await userDetails.save();

    return res.status(200).json({
      error: false,
      message: "Profile updated successfully.",
      data:{
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        email: userDetails.email,
        _id: userDetails._id,
      },
    });
  }catch (error) {
  console.error("Error updating profile:", error);
  return res.status(500).json({
    error: true,
    err: error,
    message: "Internal server error, please try again",
  });

}}

const deleteAccount = async (req: CustomRequest, res: Response) => {
  const user = req.id;

  try {
    const userDetails = await User.findOne({ _id: user });

    if (!userDetails) {
      return res.status(404).json({
        error: true,
        message: "User not found, please log in and try again.",
      });
    }
 
    await User.findOneAndDelete({ _id: user });

    return res.status(200).json({
      error: false,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user account", error);
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error, please try again",
    });
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

export { saveBillingInfo, getUser, updateBillingInfo, deleteBillingInfo, updateDefaultBillingInfo, getAllUSers, updateProfile, getBillingInfo, deleteAccount, getUserById };
