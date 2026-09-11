import type { Request, Response, NextFunction } from "express";
import { Op, Transaction } from "sequelize";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import sequelize from "../db.js";

interface HttpError extends Error {
    statusCode?: number;
}

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            name,
            description,
            price
        } = req.body;

        const product =
            await Product.create({
                name,
                description,
                price
            });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        next(error);
    }
};


export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            minPrice,
            maxPrice
        } = (req.validatedQuery || {}) as {
            page?: number;
            limit?: number;
            search?: string;
            minPrice?: number;
            maxPrice?: number;
        };

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const offset = (currentPage - 1) * pageLimit;

        const where: Record<string | symbol, unknown> = {};

        if (search && search.trim()) {
            where[Op.or as unknown as string] = [
                { name: { [Op.iLike]: `%${search.trim()}%` } },
                { description: { [Op.iLike]: `%${search.trim()}%` } }
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: Record<symbol, number> = {};

            if (minPrice !== undefined) priceFilter[Op.gte] = minPrice;
            if (maxPrice !== undefined) priceFilter[Op.lte] = maxPrice;

            where.price = priceFilter;
        }

        const result =
            await Product.findAndCountAll({
                where,
                limit: pageLimit,
                offset,
                order: [
                    ["productid", "DESC"]
                ]
            });

        return res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: currentPage,
                limit: pageLimit,
                total: result.count,
                totalPages: Math.ceil(result.count / pageLimit)
            }
        });

    } catch (error) {
        next(error);
    }
};


export const addProductToOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            productId
        } = req.body;

        // Wrap the lookups + the association write in a transaction so an
        // order can't end up with a half-added product if something fails
        // partway through (e.g. two requests racing on the same order).
        await sequelize.transaction(async (t) => {
            const order =
                await Order.findByPk(
                    req.params.orderId as string,
                    { transaction: t, lock: Transaction.LOCK.UPDATE }
                );

            if (!order) {
                const notFound: HttpError = new Error("Order not found");
                notFound.statusCode = 404;
                throw notFound;
            }

            const product =
                await Product.findByPk(
                    productId,
                    { transaction: t }
                );

            if (!product) {
                const notFound: HttpError = new Error("Product not found");
                notFound.statusCode = 404;
                throw notFound;
            }

            await order.addProduct(
                product,
                {
                    through: {
                        quantity: 1
                    },
                    transaction: t
                }
            );
        });

        return res.json({
            success: true,
            message:
                "Product added to order"
        });

    } catch (error) {
        const httpError = error as HttpError;

        if (httpError.statusCode) {
            return res.status(httpError.statusCode).json({
                success: false,
                message: httpError.message
            });
        }

        next(error);
    }
};


export const getOrderProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const order =
            await Order.findByPk(
                req.params.orderId as string,
                {
                    include: [
                        {
                            model: Product,
                            through: {
                                attributes: [
                                    "quantity"
                                ]
                            }
                        }
                    ]
                }
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: true,
            data: order
        });

    } catch (error) {
        next(error);
    }
};
