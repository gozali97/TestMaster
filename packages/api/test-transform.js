/**
 * Test Step Transformer with User's Actual Data
 * Run: node test-transform.js
 */

const { transformTestSteps } = require('./dist/utils/testStepTransformer');

// Actual test case from user's database
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
  }
];

console.log('🧪 Testing Step Transformation\n');
console.log('📥 Input Steps (from database):');
console.log(JSON.stringify(userSteps, null, 2));

try {
  const transformedSteps = transformTestSteps(userSteps);
  
  console.log('\n✅ Transformation Successful!\n');
  console.log('📤 Transformed Steps:');
  console.log(JSON.stringify(transformedSteps, null, 2));
  
  console.log('\n📋 Summary:');
  transformedSteps.forEach((step, idx) => {
    console.log(`  ${idx + 1}. [${step.actionType}] ${getDescription(step)}`);
  });
  
} catch (error) {
  console.error('\n❌ Transformation Failed!');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}

function getDescription(step) {
  const { actionType, parameters } = step;
  
  switch (actionType) {
    case 'navigate':
      return `Navigate to ${parameters.url}`;
    case 'click':
      return `Click on ${parameters.locator}`;
    case 'type':
      return `Type "${parameters.text}" into ${parameters.locator}`;
    default:
      return JSON.stringify(parameters);
  }
}
