'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      moderated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reasonForModeration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      corrected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reported: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '[]'
      },
      liked: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '[]'
      },
      loved: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '[]'
      },
      laughed: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '[]'
      },
      angered: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '[]'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};