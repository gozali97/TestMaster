const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('healing_events', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      test_result_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Reference to test execution result',
      },
      test_case_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'test_cases',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      object_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Reference to test object in object repository',
      },
      step_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Which step in the test failed',
      },
      failed_locator: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Original locator that failed',
      },
      healed_locator: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'New locator that worked',
      },
      strategy: {
        type: DataTypes.ENUM('FALLBACK', 'SIMILARITY', 'VISUAL', 'HISTORICAL'),
        allowNull: false,
        comment: 'Which healing strategy was used',
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        comment: 'Confidence score 0.00-1.00',
      },
      auto_applied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Was this healing automatically applied or manually approved',
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Manual approval status (null = pending, true = approved, false = rejected)',
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Additional metadata (DOM snapshot, screenshots, etc)',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('healing_events', ['test_case_id'], {
      name: 'idx_healing_events_test_case_id',
    });

    await queryInterface.addIndex('healing_events', ['failed_locator'], {
      name: 'idx_healing_events_failed_locator',
    });

    await queryInterface.addIndex('healing_events', ['strategy'], {
      name: 'idx_healing_events_strategy',
    });

    await queryInterface.addIndex('healing_events', ['auto_applied', 'approved'], {
      name: 'idx_healing_events_approval_status',
    });

    await queryInterface.addIndex('healing_events', ['created_at'], {
      name: 'idx_healing_events_created_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('healing_events');
  }
};
