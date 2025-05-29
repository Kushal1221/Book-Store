import jwt from "jsonwebtoken";
import User from "../models/User.js"
import "dotenv/config.js"

const protectedRoute = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");
    if (!token) {
      return res.status(400).json({ message: "Access Denied" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.userId).select("-password");
    if(!user) return res.status(401).json({message: "Token not valid"});

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in verifying token", error);
    res.status(401).json({message: "Token not valid"});
  }
};

export default protectedRoute;