import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./userModel";


export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, mobile } = req.body;
 
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
 
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      mobile: mobile || null // Optional mobile field
    });
    await newUser.save();
 
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
 };

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id , username: user.username , email: user.email}, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.cookie('token', token, {
      httpOnly: true,        
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',   
      maxAge: 3600000   
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};


export const checkEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;


    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Check if a user with this email exists
    const user = await User.findOne({ email });
    
    // Return whether the user exists, without exposing any other user data
    res.json({ 
      userExists: !!user 
    });
  } catch (error) {
    next(error);
  }
};

export const checkLoginStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.json({ 
        isLoggedIn: false, 
        user: null 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    res.json({ 
      isLoggedIn: true, 
      user: decoded 
    });
    
  } catch (error) {
    // Any error (expired, invalid, etc.) - user is not logged in
    res.json({ 
      isLoggedIn: false, 
      user: null 
    });
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ 
      message: "Logged out successfully" 
    });
  } catch (error) {
    next(error);
  }
};