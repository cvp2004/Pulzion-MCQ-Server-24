// import { NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { Request, Response } from 'express';
// import { PrismaClient } from "@prisma/client";
// import { ReqMid } from "../../../database/interfaces/user.interface";

// const prisma = new PrismaClient();

// export const isAuthenticated = async (req: ReqMid, res: Response, next: NextFunction) => {
//     try {
//         // Extract token from Authorization header
//         const authHeader = req.header("Authorization");
//         const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

//         if (!token) {
//             return res.status(401).json({ error: "Unauthorized user! No token provided." });
//         }

//         // Query the database to find the token and check its validity
//         const userToken = await prisma.userToken.findFirst({
//             where: { token },
//             include: { user: true }
//         });

//         if (!userToken) {
//             return res.status(401).json({ error: "Unauthorized user! Invalid or expired token." });
//         }

//         const user_id = userToken.userId;
//         const user = await prisma.user.findUnique({
//             where: { id: user_id },
//         });

//         if (!user) {
//             return res.status(404).json({ error: "User not found." });
//         }

//         req.user = user;
//         req.token = userToken.token;

//         // If token is valid, proceed to the next middleware
//         next();
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };


// export const generateUserToken = async (user_id: string) => {
//     try {
//         console.log(user_id);
//         const key = process.env.TOKEN_SECRET || 'default_secret_key';
//         const token = jwt.sign({ id: user_id }, key, { expiresIn: '24h' });

//         const tokenRecord = await prisma.userToken.create({
//             data: {
//                 userId: parseInt(user_id),
//                 token,
//             },
//             include: {
//                 user: true,
//             }
//         });


//         return token;
//     } catch (err: any) {
//         console.log(err);
//         throw new Error('Could not generate user token');
//     }
// };
