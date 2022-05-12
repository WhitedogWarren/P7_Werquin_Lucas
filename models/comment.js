const { DataTypes } = require('sequelize');
const sequelize = require('./connector');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    moderated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    reasonForModeration: {
        type: DataTypes.STRING,
        allowNull:true
    },
    corrected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    reported: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    },
    liked: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    },
    loved: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    },
    laughed: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    },
    angered: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    }
})

module.exports = Comment;