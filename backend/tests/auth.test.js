const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');

const stamp = Date.now();
const user = {
  email: `tester${stamp}@test.local`,
  username: `tester${stamp}`,
  password: 'Password123',
};

async function cleanup() {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test.local' } } });
}

beforeAll(cleanup);
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user (positive)', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...user, username: `other${stamp}` });
    expect(res.status).toBe(409);
  });

  it('rejects duplicate username (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...user, email: `other${stamp}@test.local` });
    expect(res.status).toBe(409);
  });

  it('rejects invalid email (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...user, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects short password (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `short${stamp}@test.local`, username: `short${stamp}`, password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects missing fields (negative)', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with email (positive)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('logs in with username (positive)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.username, password: user.password });
    expect(res.status).toBe(200);
  });

  it('rejects wrong password (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown user (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nobody@test.local', password: 'Whatever123' });
    expect(res.status).toBe(401);
  });

  it('rejects empty body (negative)', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/users (protected)', () => {
  let tokens;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: user.password });
    tokens = res.body;
  });

  it('returns user list with valid token (positive)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users[0].password).toBeUndefined();
  });

  it('rejects request without token (negative)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('rejects invalid token (negative)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer this.is.fake');
    expect(res.status).toBe(401);
  });

  it('rejects refresh token used as access token (negative)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokens.refreshToken}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  let tokens;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: user.password });
    tokens = res.body;
  });

  it('issues new tokens (positive)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: tokens.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(tokens.refreshToken);
  });

  it('rejects reuse of a rotated refresh token (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: tokens.refreshToken });
    expect(res.status).toBe(401);
  });

  it('rejects garbage refresh token (negative)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'garbage' });
    expect(res.status).toBe(401);
  });
});
