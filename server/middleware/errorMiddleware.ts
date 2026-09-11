import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
    statusCode?: number;
}

const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    if (res.headersSent) {
        return next(err);
    }

    if (err.name === "MulterError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    const statusCode = err.statusCode || 500;

    const message =
        statusCode === 500
            ? "Internal Server Error"
            : err.message || "Request failed";

    res.status(statusCode).json({
        success: false,
        message
    });
};

export default errorMiddleware;
