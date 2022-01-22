const { DataTypes } = require('sequelize');
const sequelize = require('./connector');

const Post = sequelize.define('Post', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
})

module.exports = Post;