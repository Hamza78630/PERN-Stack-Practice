"use strict";

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable("userprofiles", {
        profileid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        userid: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: "users",
                key: "userid"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },

        phone: {
            type: Sequelize.STRING(30),
            allowNull: true
        },

        address: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        bio: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    });

    await queryInterface.createTable("products", {
        productid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        name: {
            type: Sequelize.STRING(100),
            allowNull: false
        },

        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        price: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    await queryInterface.createTable("orderitems", {
        orderid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "orders",
                key: "orderid"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },

        productid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "products",
                key: "productid"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },

        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable("orderitems");
    await queryInterface.dropTable("products");
    await queryInterface.dropTable("userprofiles");
}