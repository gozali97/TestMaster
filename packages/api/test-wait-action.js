/**
 * Test Wait Action Transformation
 * Run: node test-wait-action.js
 */

const { transformTestSteps, validateTestSteps, getStepDescription } = require('./dist/utils/testStepTransformer');

// User's actual test case with wait action
const userSteps = [
  {
    "id": "1761334792070",
    "value": "https://comathedu.id/",
    "action": "navigate",
    "enabled": true,
    "description": "https://comathedu.id/"
  },
  {
    "id": "1761334827253",
    "value": "https://comathedu.id/login",
    "action": "navigate",
    "enabled": true,
    "description": "login"
  },
  {
    "id": "1761334842623",
    "value": "admin@comath.id",
    "action": "fill",
    "enabled": true,
    "locator": "#email"
  },
  {
    "id": "1761334904822",
    "value": "password123",
    "action": "fill",
    "enabled": true,
    "locator": "#password",
    "description": "pass"
  },
  {
    "id": "1761334926206",
    "action": "click",
    "enabled": true,
    "locator": "button[@type='submit']"
  },
  {
    "id": "1761367427450",
    "value": "100000",                // ✅ Should map to duration
    "action": "wait",
    "enabled": true,
    "timeout": 100000
  }
];

console.log('🧪 Testing Wait Action Transformation\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📥 INPUT: User Steps from Database');
console.log('───────────────────────────────────────────────────────────');
console.log(JSON.stringify(userSteps, null, 2));
console.log('\n');

try {
  console.log('🔄 TRANSFORMING Steps...\n');
  const transformedSteps = transformTestSteps(userSteps);
  
  console.log('✅ TRANSFORMATION SUCCESSFUL!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📤 OUTPUT: Transformed Steps');
  console.log('───────────────────────────────────────────────────────────');
  console.log(JSON.stringify(transformedSteps, null, 2));
  console.log('\n');
  
  // Validate steps
  console.log('🔍 VALIDATING Steps...\n');
  const validation = validateTestSteps(transformedSteps);
  
  if (validation.valid) {
    console.log('✅ VALIDATION SUCCESSFUL!\n');
  } else {
    console.log('❌ VALIDATION FAILED!');
    console.log('Errors:', validation.errors);
    console.log('\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 EXECUTION SUMMARY:');
  console.log('───────────────────────────────────────────────────────────');
  transformedSteps.forEach((step, idx) => {
    const desc = getStepDescription(step);
    console.log(`  ${idx + 1}. [${step.actionType.toUpperCase()}] ${desc}`);
  });
  console.log('───────────────────────────────────────────────────────────');
  
  // Focus on wait action
  const waitStep = transformedSteps.find(s => s.actionType === 'wait');
  if (waitStep) {
    console.log('\n🎯 WAIT ACTION DETAILS:');
    console.log('───────────────────────────────────────────────────────────');
    console.log('  ID:', waitStep.id);
    console.log('  Action Type:', waitStep.actionType);
    console.log('  Duration:', waitStep.parameters.duration, 'ms');
    console.log('  Duration (seconds):', waitStep.parameters.duration / 1000, 's');
    console.log('  Duration (minutes):', (waitStep.parameters.duration / 1000 / 60).toFixed(2), 'min');
    console.log('  Timeout:', waitStep.timeout, 'ms');
    console.log('───────────────────────────────────────────────────────────');
    
    if (waitStep.parameters.duration) {
      console.log('\n✅ SUCCESS: Wait action has duration parameter!');
      console.log(`   Browser will wait for ${waitStep.parameters.duration / 1000} seconds`);
    } else {
      console.log('\n❌ ERROR: Wait action missing duration parameter!');
    }
  } else {
    console.log('\n❌ ERROR: No wait action found in transformed steps!');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('🎉 TEST COMPLETE!\n');
  
} catch (error) {
  console.log('\n❌ TRANSFORMATION FAILED!');
  console.log('═══════════════════════════════════════════════════════════');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(1);
}
