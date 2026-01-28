// Test each import individually
console.log('Testing imports...\n');

try {
  console.log('1. Testing authRoutes import...');
  const authRoutes = require('./src/modules/auth/auth.routes').default;
  console.log('   ✓ authRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing authRoutes:', error.message);
}

try {
  console.log('2. Testing adminRoutes import...');
  const adminRoutes = require('./src/modules/admin/admin.routes').default;
  console.log('   ✓ adminRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing adminRoutes:', error.message);
}

try {
  console.log('3. Testing apartmentRoutes import...');
  const apartmentRoutes = require('./src/modules/apartments/apartment.routes').default;
  console.log('   ✓ apartmentRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing apartmentRoutes:', error.message);
}

try {
  console.log('4. Testing complexRoutes import...');
  const complexRoutes = require('./src/modules/complexes/complex.routes').default;
  console.log('   ✓ complexRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing complexRoutes:', error.message);
}

try {
  console.log('5. Testing userRoutes import...');
  const userRoutes = require('./src/modules/users/user.routes').default;
  console.log('   ✓ userRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing userRoutes:', error.message);
}

try {
  console.log('6. Testing analyticsRoutes import...');
  const analyticsRoutes = require('./src/modules/analytics/analytics.routes').default;
  console.log('   ✓ analyticsRoutes imported successfully');
} catch (error) {
  console.log('   ✗ Error importing analyticsRoutes:', error.message);
}

console.log('\nAll imports tested.');