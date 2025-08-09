#!/bin/bash
npm ci --legacy-peer-deps
if [ -d backend ]; then
  (cd backend && npm ci --legacy-peer-deps)
fi

# install global development tools, including AWS Amplify CLI
npm install -g expo-cli firebase-tools @aws-amplify/cli
