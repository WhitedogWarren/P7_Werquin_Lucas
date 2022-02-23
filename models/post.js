const { DataTypes } = require('sequelize');
const sequelize = require('./connector');

const Post = sequelize.define('Post', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    moderated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    reasonForModeration: {
        type: DataTypes.STRING,
        allowNull: true
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

module.exports = Post;