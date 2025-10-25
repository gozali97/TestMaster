/**
 * Test Wait Action - Verify Type is Number
 * Run: node test-wait-type.js
 */

const { transformTestSteps } = require('./dist/utils/testStepTransformer');

const testStep = {
  "id": "1761367427450",
  "value": "100000",        // String from JSON
  "action": "wait",
  "enabled": true,
  "timeout": 100000
};

console.log('🧪 Testing Wait Duration Type Conversion\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📥 INPUT:');
console.log(JSON.stringify(testStep, null, 2));
console.log('\nType of value:', typeof testStep.value);
console.log('Value:', testStep.value);
console.log('\n');

try {
  const transformedSteps = transformTestSteps([testStep]);
  const waitStep = transformedSteps[0];
  
  console.log('📤 OUTPUT:');
  console.log(JSON.stringify(waitStep, null, 2));
  console.log('\n');
  
  console.log('🔍 TYPE CHECKING:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('Duration value:', waitStep.parameters.duration);
  console.log('Duration type:', typeof waitStep.parameters.duration);
  console.log('Is number?', typeof waitStep.parameters.duration === 'number');
  console.log('Is string?', typeof waitStep.parameters.duration === 'string');
  console.log('───────────────────────────────────────────────────────────\n');
  
  if (typeof waitStep.parameters.duration === 'number') {
    console.log('✅ SUCCESS: Duration is a NUMBER!');
    console.log(`   Playwright will accept: ${waitStep.parameters.duration}ms\n`);
  } else {
    console.log('❌ ERROR: Duration is NOT a number!');
    console.log(`   Type: ${typeof waitStep.parameters.duration}`);
    console.log(`   Value: ${waitStep.parameters.duration}\n`);
    process.exit(1);
  }
  
  // Test with Playwright's requirement
  console.log('🎯 PLAYWRIGHT COMPATIBILITY TEST:');
  console.log('───────────────────────────────────────────────────────────');
  
  // Simulate what Playwright does
  const duration = waitStep.parameters.duration;
  if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
    console.log('✅ Duration is valid for Playwright');
    console.log(`   page.waitForTimeout(${duration}) will work!`);
  } else {
    console.log('❌ Duration is INVALID for Playwright');
    console.log(`   page.waitForTimeout(${duration}) will FAIL!`);
    process.exit(1);
  }
  
  console.log('───────────────────────────────────────────────────────────\n');
  console.log('🎉 ALL CHECKS PASSED!\n');
  
} catch (error) {
  console.log('❌ TRANSFORMATION FAILED!');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
