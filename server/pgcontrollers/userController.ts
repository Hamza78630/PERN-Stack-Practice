import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

import User from "../models/User.js";
import Order from "../models/Order.js";
import { emailQueue } from "../queues/emailQueue.js";

const createAccessToken = (user: User) => {
    return jwt.sign(
        {
            id: user.userid.toString(),
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1h",
            algorithm: "HS256"
        }
    );
};


// ==========================================
// CREATE
// Registration
// ==========================================

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        const normalizedEmail =
            email.toLowerCase();

        const existingUser =
            await User.findOne({
                where: {
                    email: normalizedEmail
                }
            });

        if (existingUser) {
            return res.status(409).json({
                status: "fail",
                message: "User already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const avatarUrl = req.file
            ? `/uploads/avatars/${req.file.filename}`
            : "";

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "User",
            avatarurl: avatarUrl
        });

        const io = req.app.get("io");

        if (io) {
            io.to("admins").emit(
                "newUserRegistered",
                {
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            );
        }

        // Sending the welcome email is queued (not awaited inline) so a
        // slow/down SMTP server never delays or fails the registration
        // response — the emailWorker process delivers it separately.
        emailQueue
            .add("welcome-email", {
                type: "welcome",
                to: newUser.email,
                name: newUser.name
            })
            .catch((error) =>
                console.error("Failed to queue welcome email:", (error as Error).message)
            );

        return res.status(201).json({
            status: "success",
            message: "Registration Successful"
        });

    } catch (error) {
        if ((error as Error).name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                status: "fail",
                message: "User already exists"
            });
        }

        next(error);
    }
};


// ==========================================
// READ
// Login
// ==========================================

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            email,
            password
        } = req.body;

        const normalizedEmail =
            email.toLowerCase();

        const user =
            await User.findOne({
                where: {
                    email: normalizedEmail
                }
            });

        if (!user) {
            return res.status(401).json({
                status: "fail",
                message:
                    "Invalid email or password"
            });
        }

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordCorrect) {
            return res.status(401).json({
                status: "fail",
                message:
                    "Invalid email or password"
            });
        }

        const token =
            createAccessToken(user);

        return res.json({
            status: "success",
            message: "Login successful",
            token,
            role: user.role
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// READ
// Profile
// ==========================================

export const profileUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user =
            await User.findByPk(
                req.user!.id,
                {
                    attributes: [
                        "userid",
                        "name",
                        "email",
                        "role",
                        "avatarurl"
                    ]
                }
            );

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        return res.json({
            status: "success",
            user
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// READ
// User statistics
// ==========================================

export const getPgUserStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            role
        } = (req.validatedQuery || {}) as { role?: string };

        const where: Record<string, unknown> = {};

        if (role) {
            where.role = role;
        }

        const result =
            await User.findAll({
                attributes: [
                    "role",
                    [
                        User.sequelize!.fn(
                            "COUNT",
                            User.sequelize!.col(
                                "userid"
                            )
                        ),
                        "totalUsers"
                    ]
                ],

                where,

                group: ["role"],

                order: [
                    ["role", "ASC"]
                ],

                raw: true
            });

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// READ
// Get all users
// ==========================================

export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            page = "1",
            limit = "10",
            search = "",
            role
        } = req.query as {
            page?: string;
            limit?: string;
            search?: string;
            role?: string;
        };

        const currentPage =
            Math.max(
                parseInt(page, 10) || 1,
                1
            );

        const pageLimit =
            Math.min(
                Math.max(
                    parseInt(limit, 10) || 10,
                    1
                ),
                100
            );

        const offset =
            (currentPage - 1) *
            pageLimit;

        const where: Record<string | symbol, unknown> = {};

        if (role) {
            where.role = role;
        }

        if (search.trim()) {
            where[Op.or as unknown as string] = [
                {
                    name: {
                        [Op.iLike]:
                            `%${search.trim()}%`
                    }
                },
                {
                    email: {
                        [Op.iLike]:
                            `%${search.trim()}%`
                    }
                }
            ];
        }

        const result =
            await User.findAndCountAll({
                attributes: [
                    "userid",
                    "name",
                    "email",
                    "role",
                    "avatarurl"
                ],

                where,

                limit: pageLimit,
                offset,

                order: [
                    ["userid", "DESC"]
                ]
            });

        return res.json({
            success: true,

            data: result.rows,

            pagination: {
                page: currentPage,
                limit: pageLimit,
                total: result.count,
                totalPages:
                    Math.ceil(
                        result.count /
                        pageLimit
                    )
            }
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// READ
// Get one user
// ==========================================

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user =
            await User.findByPk(
                req.params.id as string,
                {
                    attributes: [
                        "userid",
                        "name",
                        "email",
                        "role",
                        "avatarurl"
                    ]
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// UPDATE
// Update user
// ==========================================

export const updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user =
            await User.findByPk(
                req.params.id as string
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const {
            name,
            email,
            role
        } = req.body;

        if (name !== undefined) {
            user.name = name;
        }

        if (email !== undefined) {
            user.email =
                email.toLowerCase();
        }

        if (role !== undefined) {
            user.role = role;
        }

        await user.save();

        return res.json({
            success: true,
            message: "User updated successfully",
            data: {
                userid: user.userid,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarurl: user.avatarurl
            }
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// DELETE
// Delete user
// ==========================================

export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user =
            await User.findByPk(
                req.params.id as string
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await user.destroy();

        return res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// READ
// Get user's orders
// Demonstrates hasMany / belongsTo
// ==========================================

export const getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user =
            await User.findByPk(
                req.params.id as string,
                {
                    attributes: [
                        "userid",
                        "name",
                        "email"
                    ],

                    include: [
                        {
                            model: Order
                        }
                    ]
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};
