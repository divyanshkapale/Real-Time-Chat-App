import express from "express"
import jwt, { decode } from "jsonwebtoken"
import User from "../model/User.model.js"

export const protectedRoute = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:"Unauthorized - No token Provided"})
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized - invalid Provided"})
        }

        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"User Not Found"})
        }
        req.user=user
        next();

    }
    catch(error){
        console.log("Error in Protected Middleware",error)
        res.status(500).json({message:"Internal Server Error"})
    }

}