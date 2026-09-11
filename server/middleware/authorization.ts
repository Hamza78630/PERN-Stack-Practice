import type { Request, Response, NextFunction } from "express";

export const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({
            status: "fail",
            message: "Authentication required"
        });
    }

    if (req.user.role !== "Admin") {
        return res.status(403).json({
            status: "fail",
            message: "Admin access required"
        });
    }

    next();
};
