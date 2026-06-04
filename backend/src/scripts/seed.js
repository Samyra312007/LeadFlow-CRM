const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { Lead, LEAD_STATUS } = require('../models/Lead.model');

const sampleLeads = [
  { name: 'Sarah Johnson', email: 'sarah.j@acme.com', phone: '+1-555-0101', company: 'Acme Industries', status: LEAD_STATUS.NEW, notes: 'Met at SaaS conf. Interested in Pro plan.' },
  { name: 'Michael Chen', email: 'm.chen@stellar.io', phone: '+1-555-0102', company: 'Stellar Tech', status: LEAD_STATUS.CONTACTED, notes: 'Called. Requested pricing sheet.' },
  { name: 'Elena Rodriguez', email: 'elena@vortex.com', phone: '+1-555-0103', company: 'Vortex Global', status: LEAD_STATUS.QUALIFIED, notes: 'Demo completed. Budget approved Q3.' },
  { name: 'David Miller', email: 'd.miller@peaklogistics.net', phone: '+1-555-0104', company: 'Peak Logistics', status: LEAD_STATUS.LOST, notes: 'Chose competitor.' },
  { name: 'Amanda Park', email: 'amanda.p@cloudscale.com', phone: '+1-555-0105', company: 'Cloud Scale', status: LEAD_STATUS.CONVERTED, notes: 'Signed Enterprise plan.' },
  { name: 'Marcus Thorne', email: 'm.thorne@cyberdyne.io', phone: '+1-555-0106', company: 'CyberDyne Inc', status: LEAD_STATUS.QUALIFIED, notes: '250+ seat requirement. High priority.' },
  { name: 'Lisa Miller', email: 'l.miller@datapeak.com', phone: '+1-555-0107', company: 'DataPeak Analytics', status: LEAD_STATUS.NEW, notes: 'Inbound from website.' },
  { name: 'James Wilson', email: 'j.wilson@orbital.com', phone: '+1-555-0108', company: 'Orbital Systems', status: LEAD_STATUS.CONTACTED, notes: 'Follow-up scheduled for next week.' },
  { name: 'Priya Sharma', email: 'priya@nexgen.co', phone: '+1-555-0109', company: 'NexGen Solutions', status: LEAD_STATUS.QUALIFIED, notes: 'Very interested in automation features.' },
  { name: 'Tom Baker', email: 'tom.b@foundry.io', phone: '+1-555-0110', company: 'Foundry Innovations', status: LEAD_STATUS.LOST, notes: 'Not a fit at this time.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Lead.deleteMany({});
    console.log('Cleared existing leads');

    const created = await Lead.insertMany(sampleLeads);
    console.log(`Seeded ${created.length} leads successfully`);

    const stats = await Lead.getStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));

    await mongoose.disconnect();
    console.log('Done - disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
