#!/bin/bash
npm ci
if [ -d backend ]; then
  (cd backend && npm ci)
fi
