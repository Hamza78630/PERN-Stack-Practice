"use strict";

// Indexes for the columns that are actually filtered/joined/looked up
// on the hot paths: order lookups by user and by Stripe session
// (paymentController), product search/price filtering and pagination
// (productController), and the reverse orderitems -> product lookup.
// The orders/users/orderitems primary and unique keys already have
// implicit indexes from an earlier migration, so they aren't repeated
// here.

export async function up(queryInterface) {
    await queryInterface.addIndex("orders", ["userid"], {
        name: "orders_userid_idx"
    });

    await queryInterface.addIndex("orders", ["stripesessionid"], {
        name: "orders_stripesessionid_idx"
    });

    await queryInterface.addIndex("orders", ["status"], {
        name: "orders_status_idx"
    });

    await queryInterface.addIndex("products", ["name"], {
        name: "products_name_idx"
    });

    await queryInterface.addIndex("products", ["price"], {
        name: "products_price_idx"
    });

    await queryInterface.addIndex("orderitems", ["productid"], {
        name: "orderitems_productid_idx"
    });
}

export async function down(queryInterface) {
    await queryInterface.removeIndex("orders", "orders_userid_idx");
    await queryInterface.removeIndex("orders", "orders_stripesessionid_idx");
    await queryInterface.removeIndex("orders", "orders_status_idx");
    await queryInterface.removeIndex("products", "products_name_idx");
    await queryInterface.removeIndex("products", "products_price_idx");
    await queryInterface.removeIndex("orderitems", "orderitems_productid_idx");
}
