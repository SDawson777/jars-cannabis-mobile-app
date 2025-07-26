#!/bin/bash
npm ci --legacy-peer-deps
if [ -d backend ]; then
  (cd backend && npm ci --legacy-peer-deps)
fi
