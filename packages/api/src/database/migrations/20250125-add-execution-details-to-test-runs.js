const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to test_runs table
    await queryInterface.addColumn('test_runs', 'logs', {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true,
    });

    await queryInterface.addColumn('test_runs', 'screenshots', {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: true,
    });

    await queryInterface.addColumn('test_runs', 'video', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('test_runs', 'error_message', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('test_runs', 'error_stack', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    console.log('✅ Migration completed: Added execution details columns to test_runs');
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('test_runs', 'error_stack');
    await queryInterface.removeColumn('test_runs', 'error_message');
    await queryInterface.removeColumn('test_runs', 'video');
    await queryInterface.removeColumn('test_runs', 'screenshots');
    await queryInterface.removeColumn('test_runs', 'logs');

    console.log('✅ Rollback completed: Removed execution details columns from test_runs');
  },
};
