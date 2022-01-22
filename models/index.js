const User = require('./user');
const Post = require('./post');
const sequelize = require('./connector');

const models = {};

User.hasMany(Post);
Post.belongsTo(User);

models.User = User;
models.Post = Post;

sequelize.sync({alter:true});

module.exports = models;