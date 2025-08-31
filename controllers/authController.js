import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import {successResponse,errorResponse,badRequest,unauthorized,notFound, serverError} from '../utils/response.js'
// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return badRequest(res,"User already exists");

    const user = await User.create({ username, email, password, role });

    successResponse(res,{
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },"User registered successfully!",201);
  } catch (error) {
    serverError(res,"Internal server Error",error.message);
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      successResponse(res,{
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },"Login successfull!",200);
    } else {
      unauthorized(res,"Invalid credentials");
    }
  } catch (error) {
    serverError(res,"Internal Server Error!",error.message);
  }
};
