/**
 * Basic tests for DocuFresh
 * Run with: node tests/core.test.js
 */

const docufresh = require('../src/index.js');

// Test counter
let passed = 0;
let failed = 0;

/**
 * Simple test helper
 */
function test(description, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================
// RUN TESTS
// ============================================

console.log('\n🧪 Running DocuFresh Tests...\n');

// Test 1: Current year
test('{{current_year}} returns current year', () => {
  const result = docufresh.process('Year: {{current_year}}');
  const expected = `Year: ${new Date().getFullYear()}`;
  assert(result === expected, `Expected "${expected}", got "${result}"`);
});

// Test 2: Custom data replacement
test('Custom data replacement works', () => {
  const result = docufresh.process('Hello {{name}}!', { name: 'World' });
  assert(result === 'Hello World!', `Expected "Hello World!", got "${result}"`);
});

// Test 3: Multiple markers
test('Multiple markers in one string', () => {
  const result = docufresh.process('{{current_month}} {{current_year}}');
  assert(result.includes(new Date().getFullYear().toString()), 'Should contain current year');
});

// Test 4: Years since (FIXED)
test('{{years_since}} calculates correctly', () => {
  const result = docufresh.process('{{years_since:2020-01-01}}');
  const expected = (new Date().getFullYear() - 2020).toString();
  assert(result === expected, `Expected "${expected}", got "${result}"`);
});

// Test 5: Age calculation
test('{{age}} calculates age correctly', () => {
  const result = docufresh.process('{{age:2000-01-01}}');
  const age = parseInt(result);
  assert(age >= 24 && age <= 26, `Age should be 24-26, got ${age}`);
});

// Test 6: Addition (FIXED - debug version)
test('{{add}} adds numbers', () => {
  const input = '{{add:5,3,2}}';
  const result = docufresh.process(input);
  console.log(`   DEBUG: Input="${input}", Output="${result}"`);
  assert(result === '10', `Expected "10", got "${result}"`);
});

// Test 7: Unknown marker (should leave unchanged)
test('Unknown markers remain unchanged', () => {
  const result = docufresh.process('{{unknown_marker}}');
  assert(result === '{{unknown_marker}}', `Expected "{{unknown_marker}}", got "${result}"`);
});

// Test 8: Mixed custom and built-in markers
test('Mix of custom and built-in markers', () => {
  const result = docufresh.process(
    'Hello {{name}}, the year is {{current_year}}',
    { name: 'Alice' }
  );
  assert(result.includes('Alice'), 'Should include custom name');
  assert(result.includes(new Date().getFullYear().toString()), 'Should include current year');
});

// Test 9: Custom marker registration
test('Custom marker registration works', () => {
  docufresh.registerMarker('double', (num) => (parseInt(num) * 2).toString());
  const result = docufresh.process('{{double:5}}');
  assert(result === '10', `Expected "10", got "${result}"`);
});

// Test 10: Capitalize
test('{{capitalize}} works', () => {
  const result = docufresh.process('{{capitalize:hello world}}');
  assert(result === 'Hello world', `Expected "Hello world", got "${result}"`);
});

// ============================================
// ADDITIONAL DEBUG TESTS
// ============================================

console.log('\n🔍 Debug Tests:');
console.log('='.repeat(50));

// Debug: Test each math operation individually
console.log('Testing add marker:');
const addTest = docufresh.process('{{add:5,3,2}}');
console.log(`  {{add:5,3,2}} = "${addTest}"`);

console.log('\nTesting subtract marker:');
const subTest = docufresh.process('{{subtract:10,3}}');
console.log(`  {{subtract:10,3}} = "${subTest}"`);

console.log('\nTesting multiply marker:');
const mulTest = docufresh.process('{{multiply:5,3}}');
console.log(`  {{multiply:5,3}} = "${mulTest}"`);

console.log('\nTesting years_since marker:');
const yearsTest = docufresh.process('{{years_since:2020-01-01}}');
console.log(`  {{years_since:2020-01-01}} = "${yearsTest}"`);
console.log(`  Expected: ${new Date().getFullYear() - 2020}`);

// ============================================
// RESULTS
// ============================================

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  console.log('⚠️  Some tests failed. Check the debug output above.\n');
  process.exit(1);
} else {
  console.log('🎉 All tests passed!\n');
}
