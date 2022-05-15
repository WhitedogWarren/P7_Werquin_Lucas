'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NewPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NewPosts.init({
    content: DataTypes.TEXT,
    imagUrl: DataTypes.STRING,
    moderated: DataTypes.BOOLEAN,
    reasonForModeration: DataTypes.STRING,
    corrected: DataTypes.BOOLEAN,
    reported: DataTypes.STRING,
    liked: DataTypes.STRING,
    loved: DataTypes.STRING,
    laughed: DataTypes.STRING,
    angered: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'NewPosts',
  });
  return NewPosts;
};