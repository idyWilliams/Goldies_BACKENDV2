import { Request, Response } from "express"


const makePayment = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body
     } catch (error) {
        console.error("Login Error:", error); // Log the error to console
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
            err: error,
        });
  }
}