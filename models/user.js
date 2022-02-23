const { DataTypes } = require('sequelize');
const sequelize = require('./connector');

const User = sequelize.define('User', {
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bio: {
        type: DataTypes.TEXT
    },
    role: {
        type: DataTypes.STRING
    }

})

module.exports = User;