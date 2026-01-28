console.log('=== DEBUG ANALYTICS MODULE ===\n');

// Test 1: Try to import analytics.routes.ts
try {
  console.log('1. Testing direct import...');
  const module = require('./src/modules/analytics/analytics.routes');
  console.log('   Module loaded:', Object.keys(module));
  console.log('   Default export exists:', 'default' in module ? 'YES' : 'NO');
  console.log('   Default export value:', module.default ? 'Exists' : 'Undefined');
} catch (error) {
  console.log('   ✗ Error:', error.message);
}

// Test 2: Check if file exists
console.log('\n2. Checking file existence...');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/modules/analytics/analytics.routes.ts');
console.log('   File exists:', fs.existsSync(filePath) ? 'YES' : 'NO');

// Test 3: Try to import controller
console.log('\n3. Testing controller import...');
try {
  const controllerModule = require('./src/modules/analytics/analytics.controller');
  console.log('   Controller loaded:', Object.keys(controllerModule));
} catch (error) {
  console.log('   ✗ Controller error:', error.message);
}

// Test 4: Try to import service
console.log('\n4. Testing service import...');
try {
  const serviceModule = require('./src/modules/analytics/analytics.service');
  console.log('   Service loaded:', Object.keys(serviceModule));
} catch (error) {
  console.log('   ✗ Service error:', error.message);
}

console.log('\n=== DEBUG COMPLETE ===');