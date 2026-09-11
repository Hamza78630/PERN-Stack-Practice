import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const loginAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "fail",
                message: "Bearer authorization token required"
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "Authorization token required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
            algorithms: ["HS256"]
        });

        req.user = decoded as Request["user"];
        next();
    }
    catch (error) {
        return res.status(401).json({
            status: "fail",
            message: "Authorization token invalid or expired"
        });
    }
};
