import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize";

import sequelize from "../db.js";

class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare userid: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare password: string;
    declare role: CreationOptional<string>;
    declare avatarurl: CreationOptional<string | null>;
}

User.init(
    {
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: "Name is required"
                },

                len: {
                    args: [2, 100],
                    msg: "Name must be between 2 and 100 characters"
                }
            }
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,

            validate: {
                notEmpty: {
                    msg: "Email is required"
                },

                isEmail: {
                    msg: "Email must be valid"
                }
            }
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: "Password is required"
                }
            }
        },

        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "User",

            validate: {
                isIn: {
                    args: [
                        ["User", "Admin"]
                    ],
                    msg: "Role must be User or Admin"
                }
            }
        },

        avatarurl: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ""
        }
    },

    {
        sequelize,
        tableName: "users",
        timestamps: false
    }
);

export default User;
