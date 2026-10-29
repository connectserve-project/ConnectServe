const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Event } = require('../models');
const { Op } = require('sequelize');

async function updateOutdatedEvents() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(23, 59, 59, 999);

  console.log('Current time:', new Date().toISOString());
  console.log('Events older than this will be completed:', cutoff.toISOString());

  const events = await Event.findAll({
    where: {
      status: { [Op.ne]: 'completed' },
      [Op.or]: [
        { endDate: { [Op.lt]: cutoff } },
        { endDate: null, date: { [Op.lt]: cutoff } },
      ],
    },
  });

  console.log(`Found ${events.length} outdated event(s) to mark as completed:`);
  for (const ev of events) {
    console.log(`- ID: ${ev.id} | Title: "${ev.title}" | Date: ${ev.date}`);
  }

  const [updatedCount] = await Event.update(
    { status: 'completed' },
    {
      where: {
        status: { [Op.ne]: 'completed' },
        [Op.or]: [
          { endDate: { [Op.lt]: cutoff } },
          { endDate: null, date: { [Op.lt]: cutoff } },
        ],
      },
    }
  );

  console.log(`Successfully updated ${updatedCount} event(s) to 'completed'.`);
  process.exit(0);
}

updateOutdatedEvents().catch(err => {
  console.error('Error updating events:', err);
  process.exit(1);
});
