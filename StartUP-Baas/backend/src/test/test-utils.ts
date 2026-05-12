/**
 * Test utilities for mocking providers and dependencies
 */

export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
});

export const createMockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

export const createMockJwtService = () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ sub: 'test-id' }),
  decode: jest.fn().mockReturnValue({ sub: 'test-id' }),
});

export const createMockConfigService = () => ({
  get: jest.fn().mockReturnValue('test-value'),
});

export const createMockMailerService = () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
});
