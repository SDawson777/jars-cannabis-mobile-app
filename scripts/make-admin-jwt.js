#!/usr/bin/env node
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'test-secret-key';
const userId = process.argv[2] || 'admin-user-id';
const payload = { userId, roles: ['admin'] };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);
