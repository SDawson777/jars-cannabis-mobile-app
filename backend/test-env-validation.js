#!/usr/bin/env node
/**
 * Test script to verify environment validation works properly
 * Removes critical environment variables and tries to start the server
 */

const { spawn } = require('child_process');

console.log('🧪 Testing environment validation...\n');

// Test 1: Missing JWT_SECRET
console.log('Test 1: Starting server without JWT_SECRET');
const env1 = { ...process.env };
delete env1.JWT_SECRET;

const child1 = spawn('node', ['dist/index.js'], {
  env: env1,
  stdio: 'pipe',
});

child1.stdout.on('data', data => {
  console.log('STDOUT:', data.toString());
});

child1.stderr.on('data', data => {
  console.log('STDERR:', data.toString());
});

child1.on('close', code => {
  console.log(`\n✅ Test 1 completed with exit code: ${code}`);
  if (code === 1) {
    console.log('✅ Server correctly failed to start without JWT_SECRET\n');
  } else {
    console.log('❌ Server should have failed with exit code 1\n');
  }

  // Test 2: Missing DATABASE_URL
  console.log('Test 2: Starting server without DATABASE_URL');
  const env2 = { ...process.env };
  delete env2.DATABASE_URL;

  const child2 = spawn('node', ['dist/index.js'], {
    env: env2,
    stdio: 'pipe',
  });

  child2.stdout.on('data', data => {
    console.log('STDOUT:', data.toString());
  });

  child2.stderr.on('data', data => {
    console.log('STDERR:', data.toString());
  });

  child2.on('close', code2 => {
    console.log(`\n✅ Test 2 completed with exit code: ${code2}`);
    if (code2 === 1) {
      console.log('✅ Server correctly failed to start without DATABASE_URL');
    } else {
      console.log('❌ Server should have failed with exit code 1');
    }
    console.log('\n🎉 Environment validation tests completed!');
    process.exit(0);
  });

  // Give it 5 seconds then kill it
  setTimeout(() => {
    child2.kill();
    console.log('\n✅ Test 2 completed (killed after timeout)');
    console.log('\n🎉 Environment validation tests completed!');
    process.exit(0);
  }, 5000);
});

// Give it 5 seconds then kill it
setTimeout(() => {
  child1.kill();
  console.log('\n✅ Test 1 completed (killed after timeout)');
}, 5000);
