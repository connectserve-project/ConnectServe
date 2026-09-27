const crypto = require('crypto');
const { User, sequelize } = require('../models');

const backfillQrTokens = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.qrToken) {
      await queryInterface.addColumn('users', 'qrToken', {
        type: sequelize.Sequelize.STRING(64),
        unique: true,
        allowNull: true,
      });
      console.log('✅ Added qrToken column to users table.');
    }

    const usersWithoutToken = await User.findAll({
      where: {
        qrToken: null,
      },
    });

    if (usersWithoutToken.length > 0) {
      console.log(`Generating qrToken for ${usersWithoutToken.length} existing users...`);
      for (const user of usersWithoutToken) {
        user.qrToken = crypto.randomUUID();
        await user.save();
      }
      console.log(`✅ Successfully backfilled qrTokens for ${usersWithoutToken.length} users.`);
    } else {
      console.log('✅ All users already have a qrToken.');
    }
  } catch (error) {
    console.error('Error backfilling qrTokens:', error);
  }
};

module.exports = { backfillQrTokens };
