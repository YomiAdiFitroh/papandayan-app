const express = require('express');
const prisma = require('../prisma');
const authGuard = require('../middleware/auth');

const router = express.Router();

// GET /api/users  (protected)
router.get('/', authGuard, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
