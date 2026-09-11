import User from "./User.js";
import Order from "./Order.js";
import UserProfile from "./UserProfile.js";
import Product from "./Product.js";
import OrderItem from "./OrderItem.js";

// ==========================================
// ONE-TO-MANY
// User -> Orders
// ==========================================

User.hasMany(Order, {
    foreignKey: "userid",
    sourceKey: "userid"
});

Order.belongsTo(User, {
    foreignKey: "userid",
    targetKey: "userid"
});


// ==========================================
// ONE-TO-ONE
// User -> UserProfile
// ==========================================

User.hasOne(UserProfile, {
    foreignKey: "userid",
    sourceKey: "userid"
});

UserProfile.belongsTo(User, {
    foreignKey: "userid",
    targetKey: "userid"
});


// ==========================================
// MANY-TO-MANY
// Order <-> Product
// through OrderItem
// ==========================================

Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: "orderid",
    otherKey: "productid"
});

Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: "productid",
    otherKey: "orderid"
});

export {
    User,
    Order,
    UserProfile,
    Product,
    OrderItem
};
