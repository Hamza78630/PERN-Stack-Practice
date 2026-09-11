import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    BelongsToManyAddAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    NonAttribute
} from "sequelize";

import sequelize from "../db.js";
import type Product from "./Product.js";

class Order extends Model<
    InferAttributes<Order>,
    InferCreationAttributes<Order>
> {
    declare orderid: CreationOptional<number>;
    declare userid: number;
    declare amount: number;
    declare currency: CreationOptional<string>;
    declare status: CreationOptional<string>;
    declare stripesessionid: CreationOptional<string | null>;
    declare createdat: CreationOptional<Date>;
    declare updatedat: CreationOptional<Date>;

    // Populated by the Order <-> Product belongsToMany association
    // (through OrderItem) declared in associations.ts.
    declare addProduct: BelongsToManyAddAssociationMixin<Product, number>;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;
    declare Products?: NonAttribute<Product[]>;
}

Order.init(
    {
        orderid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "usd"
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending"
        },

        stripesessionid: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        createdat: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        updatedat: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: "orders",
        timestamps: false
    }
);

export default Order;
