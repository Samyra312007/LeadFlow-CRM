const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { Lead, LEAD_STATUS } = require('../../src/models/Lead.model');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

afterEach(async () => {
  await Lead.deleteMany({});
});

const validLead = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Acme Corp',
};

describe('Lead Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid lead', async () => {
      const lead = await Lead.create(validLead);
      expect(lead.name).toBe('John Doe');
      expect(lead.email).toBe('john@example.com');
      expect(lead.status).toBe(LEAD_STATUS.NEW);
      expect(lead.notes).toBe('');
      expect(lead.createdAt).toBeDefined();
      expect(lead.updatedAt).toBeDefined();
    });

    it('should reject missing name', async () => {
      const { name, ...noName } = validLead;
      await expect(Lead.create(noName)).rejects.toThrow('Name is required');
    });

    it('should reject missing email', async () => {
      const { email, ...noEmail } = validLead;
      await expect(Lead.create(noEmail)).rejects.toThrow('Email is required');
    });

    it('should reject invalid email format', async () => {
      await expect(Lead.create({ ...validLead, email: 'not-an-email' })).rejects.toThrow();
    });

    it('should reject missing phone', async () => {
      const { phone, ...noPhone } = validLead;
      await expect(Lead.create(noPhone)).rejects.toThrow('Phone number is required');
    });

    it('should reject missing company', async () => {
      const { company, ...noCompany } = validLead;
      await expect(Lead.create(noCompany)).rejects.toThrow('Company name is required');
    });

    it('should reject invalid status', async () => {
      await expect(Lead.create({ ...validLead, status: 'Invalid' })).rejects
        .toThrow('Status must be: New, Contacted, Qualified, Converted, Lost');
    });

    it('should accept all valid statuses', async () => {
      for (const status of Object.values(LEAD_STATUS)) {
        const lead = await Lead.create({ ...validLead, email: `test-${status}@example.com`, status });
        expect(lead.status).toBe(status);
      }
    });

    it('should timeout at 100 char name', async () => {
      await expect(Lead.create({ ...validLead, name: 'A'.repeat(101) })).rejects.toThrow();
    });

    it('should timeout at 150 char company', async () => {
      await expect(Lead.create({ ...validLead, company: 'B'.repeat(151) })).rejects.toThrow();
    });

    it('should default notes to empty string', async () => {
      const lead = await Lead.create(validLead);
      expect(lead.notes).toBe('');
    });

    it('should reject notes over 1000 chars', async () => {
      await expect(Lead.create({ ...validLead, notes: 'x'.repeat(1001) })).rejects.toThrow();
    });
  });

  describe('Uniqueness', () => {
    it('should reject duplicate email', async () => {
      await Lead.create(validLead);
      await expect(Lead.create(validLead)).rejects.toThrow();
    });

    it('should reject case-insensitive duplicate email', async () => {
      await Lead.create(validLead);
      await expect(Lead.create({ ...validLead, email: 'JOHN@EXAMPLE.COM' })).rejects.toThrow();
    });
  });

  describe('toJSON Transform', () => {
    it('should return id instead of _id', async () => {
      const lead = await Lead.create(validLead);
      const json = lead.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
    });
  });

  describe('getStats()', () => {
    it('should return zero stats when no leads', async () => {
      const stats = await Lead.getStats();
      expect(stats.total).toBe(0);
      expect(stats.conversionRate).toBe('0.00%');
      Object.values(LEAD_STATUS).forEach((s) => {
        expect(stats.byStatus[s]).toBe(0);
      });
    });

    it('should calculate correct stats with leads', async () => {
      await Lead.create({ ...validLead, email: 'lead1@test.com', status: LEAD_STATUS.NEW });
      await Lead.create({ ...validLead, email: 'lead2@test.com', status: LEAD_STATUS.CONTACTED });
      await Lead.create({ ...validLead, email: 'lead3@test.com', status: LEAD_STATUS.QUALIFIED });
      await Lead.create({ ...validLead, email: 'lead4@test.com', status: LEAD_STATUS.CONVERTED });
      await Lead.create({ ...validLead, email: 'lead5@test.com', status: LEAD_STATUS.LOST });

      const stats = await Lead.getStats();
      expect(stats.total).toBe(5);
      expect(stats.byStatus[LEAD_STATUS.NEW]).toBe(1);
      expect(stats.byStatus[LEAD_STATUS.CONVERTED]).toBe(1);
      expect(stats.conversionRate).toBe('20.00%');
    });

    it('should calculate 100% conversion rate', async () => {
      await Lead.create({ ...validLead, email: 'c1@test.com', status: LEAD_STATUS.CONVERTED });
      await Lead.create({ ...validLead, email: 'c2@test.com', status: LEAD_STATUS.CONVERTED });

      const stats = await Lead.getStats();
      expect(stats.total).toBe(2);
      expect(stats.conversionRate).toBe('100.00%');
    });
  });
});
