'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [{
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@groupomania.com',
      password: '$2b$10$Y.RsCXGtzi8y1.gpWc3eceTmCy7hRJbrkJftQBXyBUK3Xj1L9plWy',
      avatarUrl: 'defaultavatar.jpg',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
