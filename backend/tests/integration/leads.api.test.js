const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../src/app');
const { Lead, LEAD_STATUS } = require('../../src/models/Lead.model');

let mongo;
const base = '/api/v1/leads';

const sampleLead = {
  name: 'Alice Smith',
  email: 'alice@test.com',
  phone: '+1111111111',
  company: 'Alpha Inc',
};

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

describe('Leads API', () => {
  describe('POST /api/v1/leads', () => {
    it('should create a lead and return 201', async () => {
      const res = await request(app).post(base).send(sampleLead);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alice Smith');
      expect(res.body.data.status).toBe('New');
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post(base).send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app).post(base).send({ ...sampleLead, email: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should return 409 for duplicate email', async () => {
      await request(app).post(base).send(sampleLead);
      const res = await request(app).post(base).send(sampleLead);
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Duplicate value');
    });

    it('should lowercase email on create', async () => {
      const res = await request(app).post(base).send({ ...sampleLead, email: 'UPPERCASE@TEST.COM' });
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('uppercase@test.com');
    });

    it('should trim whitespace from name', async () => {
      const res = await request(app).post(base).send({ ...sampleLead, name: '  Trimmed Name  ' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Trimmed Name');
    });

    it('should trim whitespace from email', async () => {
      const res = await request(app).post(base).send({ ...sampleLead, email: '  spaced@test.com  ' });
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('spaced@test.com');
    });
  });

  describe('GET /api/v1/leads', () => {
    it('should return empty list when no leads', async () => {
      const res = await request(app).get(base);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return paginated leads', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com' });
      await Lead.create({ ...sampleLead, name: 'Bob', email: 'b@test.com' });
      const res = await request(app).get(base);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter by status', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com', status: LEAD_STATUS.CONTACTED });
      await Lead.create({ ...sampleLead, name: 'Bob', email: 'b@test.com', status: LEAD_STATUS.QUALIFIED });
      const res = await request(app).get(`${base}?status=Contacted`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('Contacted');
    });

    it('should search by name', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com' });
      await Lead.create({ ...sampleLead, name: 'Bob Johnson', email: 'b@test.com' });
      const res = await request(app).get(`${base}?search=Alice`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Alice Smith');
    });

    it('should respect page and limit', async () => {
      for (let i = 0; i < 5; i++) {
        await Lead.create({ ...sampleLead, email: `u${i}@test.com`, name: `User ${i}` });
      }
      const res = await request(app).get(`${base}?page=1&limit=2`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.pages).toBe(3);
    });

    it('should combine search and status filter', async () => {
      await Lead.create({ ...sampleLead, name: 'Alice Smith', email: 'a@test.com', status: LEAD_STATUS.CONTACTED });
      await Lead.create({ ...sampleLead, name: 'Alice Jones', email: 'j@test.com', status: LEAD_STATUS.QUALIFIED });
      await Lead.create({ ...sampleLead, name: 'Bob', email: 'b@test.com', status: LEAD_STATUS.CONTACTED });
      const res = await request(app).get(`${base}?search=Alice&status=Contacted`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Alice Smith');
    });

    it('should search by email', async () => {
      await Lead.create({ ...sampleLead, email: 'unique@test.com' });
      const res = await request(app).get(`${base}?search=unique@test.com`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('unique@test.com');
    });

    it('should search by company', async () => {
      await Lead.create({ ...sampleLead, company: 'Acme Corp' });
      const res = await request(app).get(`${base}?search=Acme`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].company).toBe('Acme Corp');
    });

    it('should search case-insensitively', async () => {
      await Lead.create({ ...sampleLead, name: 'CamelCase Name' });
      const res = await request(app).get(`${base}?search=camelcase`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should sort ascending by name', async () => {
      await Lead.create({ ...sampleLead, name: 'Zara', email: 'z@test.com' });
      await Lead.create({ ...sampleLead, name: 'Alpha', email: 'a@test.com' });
      const res = await request(app).get(`${base}?sort=name`);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Alpha');
      expect(res.body.data[1].name).toBe('Zara');
    });

    it('should sort descending by name', async () => {
      await Lead.create({ ...sampleLead, name: 'Zara', email: 'z@test.com' });
      await Lead.create({ ...sampleLead, name: 'Alpha', email: 'a@test.com' });
      const res = await request(app).get(`${base}?sort=-name`);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Zara');
      expect(res.body.data[1].name).toBe('Alpha');
    });
  });

  describe('GET /api/v1/leads/:id', () => {
    it('should return a lead by id', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).get(`${base}/${lead._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Alice Smith');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).get(`${base}/000000000000000000000000`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Lead not found');
    });

    it('should return 400 for invalid id format', async () => {
      const res = await request(app).get(`${base}/invalid-id`);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/v1/leads/:id', () => {
    it('should update a lead', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).put(`${base}/${lead._id}`).send({ name: 'Alice Updated' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Alice Updated');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).put(`${base}/000000000000000000000000`).send({ name: 'Nope' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/leads/:id/status', () => {
    it('should update lead status', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).patch(`${base}/${lead._id}/status`).send({ status: 'Qualified' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Qualified');
    });

    it('should return 400 for invalid status', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).patch(`${base}/${lead._id}/status`).send({ status: 'Invalid' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing status', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).patch(`${base}/${lead._id}/status`).send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).patch(`${base}/000000000000000000000000/status`).send({ status: 'Lost' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/leads/:id', () => {
    it('should delete a lead', async () => {
      const lead = await Lead.create(sampleLead);
      const res = await request(app).delete(`${base}/${lead._id}`);
      expect(res.status).toBe(200);
      const check = await Lead.findById(lead._id);
      expect(check).toBeNull();
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).delete(`${base}/000000000000000000000000`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/leads/search', () => {
    it('should search leads by text', async () => {
      await Lead.create(sampleLead);
      await Lead.create({ ...sampleLead, name: 'Bob', email: 'bob@test.com' });
      const res = await request(app).get(`${base}/search?q=Alice`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Alice Smith');
    });

    it('should return results ranked by text score', async () => {
      await Lead.create({ ...sampleLead, name: 'Alpha Corp', email: 'a@test.com' });
      await Lead.create({ ...sampleLead, name: 'Beta Alpha LLC', email: 'b@test.com' });
      const res = await request(app).get(`${base}/search?q=Alpha`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should paginate search results', async () => {
      for (let i = 0; i < 5; i++) {
        await Lead.create({ ...sampleLead, name: `Alice ${i}`, email: `a${i}@test.com` });
      }
      const res = await request(app).get(`${base}/search?q=Alice&page=1&limit=2`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.pages).toBe(3);
    });

    it('should return 400 when query is empty', async () => {
      const res = await request(app).get(`${base}/search?q=`);
      expect(res.status).toBe(400);
    });

    it('should return empty array when nothing matches', async () => {
      await Lead.create(sampleLead);
      const res = await request(app).get(`${base}/search?q=NonExistentXYZ`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/v1/leads/stats', () => {
    it('should return lead statistics with one lead', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com' });
      const res = await request(app).get(`${base}/stats`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.byStatus.New).toBe(1);
    });

    it('should return conversion rate across statuses', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com', status: LEAD_STATUS.CONVERTED });
      await Lead.create({ ...sampleLead, email: 'b@test.com', status: LEAD_STATUS.CONVERTED });
      await Lead.create({ ...sampleLead, email: 'c@test.com', status: LEAD_STATUS.LOST });
      await Lead.create({ ...sampleLead, email: 'd@test.com', status: LEAD_STATUS.NEW });
      const res = await request(app).get(`${base}/stats`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(4);
      expect(res.body.data.byStatus.Converted).toBe(2);
      expect(res.body.data.conversionRate).toBe('50.00%');
    });

    it('should return 0 for missing status categories', async () => {
      await Lead.create({ ...sampleLead, email: 'a@test.com', status: LEAD_STATUS.NEW });
      const res = await request(app).get(`${base}/stats`);
      expect(res.body.data.byStatus.Contacted).toBe(0);
      expect(res.body.data.byStatus.Qualified).toBe(0);
      expect(res.body.data.byStatus.Converted).toBe(0);
      expect(res.body.data.byStatus.Lost).toBe(0);
    });
  });

  describe('Pagination boundaries', () => {
    it('should default to page 1 when page is 0', async () => {
      for (let i = 0; i < 3; i++) {
        await Lead.create({ ...sampleLead, email: `p${i}@test.com`, name: `PageUser ${i}` });
      }
      const res = await request(app).get(`${base}?page=0`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should return last page when page exceeds total', async () => {
      for (let i = 0; i < 3; i++) {
        await Lead.create({ ...sampleLead, email: `e${i}@test.com`, name: `Exceed ${i}` });
      }
      const res = await request(app).get(`${base}?page=999&limit=10`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.page).toBe(999);
    });

    it('should cap limit to 100', async () => {
      const res = await request(app).get(`${base}?limit=999`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('should default limit to 10 when limit is 0', async () => {
      const res = await request(app).get(`${base}?limit=0`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('should default limit to 1 when limit is negative', async () => {
      const res = await request(app).get(`${base}?limit=-5`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
    });
  });

  describe('Search edge cases', () => {
    it('should handle special regex characters in search', async () => {
      await Lead.create({ ...sampleLead, name: 'Test (1)', email: 'br@test.com' });
      const res = await request(app).get(`${base}?search=Test (1)`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should return empty array for unmatched search', async () => {
      await Lead.create(sampleLead);
      const res = await request(app).get(`${base}?search=ZZZZZ`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should handle plus sign in search', async () => {
      await Lead.create({ ...sampleLead, name: 'C++ Developer', email: 'cpp@test.com' });
      const res = await request(app).get(`${base}?search=C%2B%2B`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should handle dollar sign in search', async () => {
      await Lead.create({ ...sampleLead, company: '$200k Funding', email: 'fund@test.com' });
      const res = await request(app).get(`${base}?search=%24200k`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('Full CRUD flow', () => {
    it('should complete a full lifecycle: create → read → update → delete', async () => {
      const created = await request(app).post(base).send(sampleLead);
      expect(created.status).toBe(201);
      const id = created.body.data.id;

      const read = await request(app).get(`${base}/${id}`);
      expect(read.status).toBe(200);
      expect(read.body.data.name).toBe('Alice Smith');

      const updated = await request(app).put(`${base}/${id}`).send({ name: 'Alice Updated' });
      expect(updated.status).toBe(200);
      expect(updated.body.data.name).toBe('Alice Updated');

      const del = await request(app).delete(`${base}/${id}`);
      expect(del.status).toBe(200);

      const gone = await request(app).get(`${base}/${id}`);
      expect(gone.status).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/v1/unknown');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('all error responses have consistent shape', async () => {
      const scenarios = [
        request(app).post(base).send({}),
        request(app).get(`${base}/invalid-id`),
        request(app).get(`${base}/000000000000000000000000`),
        request(app).get('/api/v1/unknown'),
      ];
      const results = await Promise.all(scenarios);
      results.forEach((res) => {
        expect(res.body.success).toBe(false);
        expect(typeof res.body.message).toBe('string');
      });
    });
  });
});
