import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize";

import sequelize from "../db.js";

class Product extends Model<
    InferAttributes<Product>,
    InferCreationAttributes<Product>
> {
    declare productid: CreationOptional<number>;
    declare name: string;
    declare description: CreationOptional<string | null>;
    declare price: number;
}

Product.init(
    {
        productid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "products",
        timestamps: false
    }
);

export default Product;
