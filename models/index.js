const User = require('./user');
const Post = require('./post');
const sequelize = require('./connector');

const models = {};

User.hasMany(Post, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
});
Post.belongsTo(User, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
});

models.User = User;
models.Post = Post;

sequelize.sync({alter:true});

module.exports = models;