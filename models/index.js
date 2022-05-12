const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const sequelize = require('./connector');

const models = {};

User.hasMany(Post, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
});
User.hasMany(Comment, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
});
Post.belongsTo(User, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
});
Post.hasMany(Comment, {
    foreignKey: 'PostId',
    onDelete: 'cascade'
})
Comment.belongsTo(User, {
    foreignKey: 'UserId',
    onDelete: 'cascade'
})
Comment.belongsTo(Post, {
    foreignKey: 'PostId',
    onDelete: 'cascade'
})

models.User = User;
models.Post = Post;
models.Comment = Comment;

sequelize.sync();

module.exports = models;