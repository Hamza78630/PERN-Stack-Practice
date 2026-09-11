import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional
} from "sequelize";

import sequelize from "../db.js";

class UserProfile extends Model<
    InferAttributes<UserProfile>,
    InferCreationAttributes<UserProfile>
> {
    declare profileid: CreationOptional<number>;
    declare userid: number;
    declare phone: CreationOptional<string | null>;
    declare address: CreationOptional<string | null>;
    declare bio: CreationOptional<string | null>;
}

UserProfile.init(
    {
        profileid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },

        phone: {
            type: DataTypes.STRING(30),
            allowNull: true
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: "userprofiles",
        timestamps: false
    }
);

export default UserProfile;
