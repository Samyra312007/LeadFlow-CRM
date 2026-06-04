const httpMocks = require('node-mocks-http');
const validate = require('../../src/middleware/validate');
const { createLeadSchema, updateLeadSchema } = require('../../src/validators/lead.validator');

function mockReq(body) {
  return httpMocks.createRequest({ method: 'POST', body });
}

function mockRes() {
  return httpMocks.createResponse({ eventEmitter: require('events').EventEmitter });
}

describe('validate middleware', () => {
  describe('createLeadSchema', () => {
    it('should pass valid lead data', () => {
      const req = mockReq({ name: 'Jane', email: 'jane@test.com', phone: '1234567890', company: 'Test Inc' });
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.name).toBe('Jane');
    });

    it('should strip unknown fields', () => {
      const req = mockReq({ name: 'Jane', email: 'jane@test.com', phone: '1234567890', company: 'Test Inc', extraField: 'should be stripped' });
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.extraField).toBeUndefined();
    });

    it('should return 400 with field-level errors for missing fields', () => {
      const req = mockReq({});
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Validation failed');
      expect(data.errors.length).toBeGreaterThanOrEqual(4);
      expect(data.errors[0]).toHaveProperty('field');
      expect(data.errors[0]).toHaveProperty('message');
    });

    it('should return 400 for invalid email', () => {
      const req = mockReq({ name: 'Jane', email: 'notanemail', phone: '1234567890', company: 'Test Inc' });
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.errors[0].field).toBe('email');
    });

    it('should return 400 for invalid status value', () => {
      const req = mockReq({ name: 'Jane', email: 'jane@test.com', phone: '1234567890', company: 'Test Inc', status: 'Unknown' });
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('updateLeadSchema', () => {
    it('should allow partial updates', () => {
      const req = mockReq({ name: 'Updated Name' });
      const res = mockRes();
      const next = jest.fn();

      validate(updateLeadSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.name).toBe('Updated Name');
    });

    it('should default status to New when omitted in create', () => {
      const req = mockReq({ name: 'Jane', email: 'jane@test.com', phone: '1234567890', company: 'Test Inc' });
      const res = mockRes();
      const next = jest.fn();

      validate(createLeadSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.status).toBe('New');
    });
  });
});
