module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing status values to match new enum
    await queryInterface.sequelize.query(`
      UPDATE test_cases 
      SET status = 'ARCHIVED' 
      WHERE status = 'DEPRECATED';
    `);

    // For PostgreSQL, we need to alter the enum type
    // For MySQL, we can directly modify the column
    const dialect = queryInterface.sequelize.getDialect();
    
    if (dialect === 'postgres') {
      // PostgreSQL approach: create new enum, alter column, drop old enum
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_test_cases_status" RENAME TO "enum_test_cases_status_old";
      `);
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_test_cases_status" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED', 'ARCHIVED');
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE test_cases 
        ALTER COLUMN status TYPE "enum_test_cases_status" 
        USING status::text::"enum_test_cases_status";
      `);
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_test_cases_status_old";
      `);
    } else {
      // MySQL/MariaDB approach: directly modify the column
      await queryInterface.changeColumn('test_cases', 'status', {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'DISABLED', 'ARCHIVED'),
        defaultValue: 'DRAFT',
        allowNull: false,
      });
    }

    // Update default value for new records
    await queryInterface.sequelize.query(`
      ALTER TABLE test_cases ALTER COLUMN status SET DEFAULT 'DRAFT';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Revert status values
    await queryInterface.sequelize.query(`
      UPDATE test_cases 
      SET status = 'DEPRECATED' 
      WHERE status = 'ARCHIVED';
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE test_cases 
      SET status = 'ACTIVE' 
      WHERE status = 'DISABLED';
    `);

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_test_cases_status" RENAME TO "enum_test_cases_status_old";
      `);
      
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_test_cases_status" AS ENUM ('ACTIVE', 'DRAFT', 'DEPRECATED');
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TABLE test_cases 
        ALTER COLUMN status TYPE "enum_test_cases_status" 
        USING status::text::"enum_test_cases_status";
      `);
      
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_test_cases_status_old";
      `);
    } else {
      await queryInterface.changeColumn('test_cases', 'status', {
        type: Sequelize.ENUM('ACTIVE', 'DRAFT', 'DEPRECATED'),
        defaultValue: 'ACTIVE',
        allowNull: false,
      });
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE test_cases ALTER COLUMN status SET DEFAULT 'ACTIVE';
    `);
  },
};
