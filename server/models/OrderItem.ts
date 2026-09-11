import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize";

import sequelize from "../db.js";

class OrderItem extends Model<
    InferAttributes<OrderItem>,
    InferCreationAttributes<OrderItem>
> {
    declare orderid: number;
    declare productid: number;
    declare quantity: CreationOptional<number>;
}

OrderItem.init(
    {
        orderid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        productid: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    },
    {
        sequelize,
        tableName: "orderitems",
        timestamps: false
    }
);

export default OrderItem;
