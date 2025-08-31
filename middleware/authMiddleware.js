import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {unauthorized} from '../utils/response.js'

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      unauthorized(res,"Not authorized, token failed");
    }
  }

  if (!token) {
    unauthorized(res,"Not authorized, no token");
  }
};
