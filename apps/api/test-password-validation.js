import { validatePassword, generateSecurePassword, generateResetToken } from './src/lib/passwordValidation.ts';

console.log('🧪 Testing Password Validation System\n');

// Test 1: Weak passwords
console.log('Test 1: Weak Passwords');
const weakPasswords = ['123', 'password', 'abc', 'qwerty'];
weakPasswords.forEach(pwd => {
  const result = validatePassword(pwd);
  console.log(`"${pwd}": ${result.strength} (${result.score}/100) - Valid: ${result.isValid}`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.join(', ')}`);
  }
});

// Test 2: Strong passwords
console.log('\nTest 2: Strong Passwords');
const strongPasswords = ['SecurePass123!', 'MyComplexP@ssw0rd', 'Tr@ining2024!'];
strongPasswords.forEach(pwd => {
  const result = validatePassword(pwd);
  console.log(`"${pwd}": ${result.strength} (${result.score}/100) - Valid: ${result.isValid}`);
  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.join(', ')}`);
  }
});

// Test 3: Personal info prevention
console.log('\nTest 3: Personal Info Prevention');
const personalInfoTest = validatePassword('jonflack123', undefined, { 
  email: 'jonflack@gmail.com', 
  firstName: 'Jon', 
  lastName: 'Flack' 
});
console.log(`"jonflack123" with personal info: Valid: ${personalInfoTest.isValid}`);
if (personalInfoTest.errors.length > 0) {
  console.log(`  Errors: ${personalInfoTest.errors.join(', ')}`);
}

// Test 4: Generate secure passwords
console.log('\nTest 4: Generated Secure Passwords');
for (let i = 0; i < 3; i++) {
  const generated = generateSecurePassword(16);
  const result = validatePassword(generated);
  console.log(`Generated: "${generated}" - ${result.strength} (${result.score}/100) - Valid: ${result.isValid}`);
}

// Test 5: Reset tokens
console.log('\nTest 5: Reset Token Generation');
for (let i = 0; i < 3; i++) {
  const token = generateResetToken();
  console.log(`Generated token: ${token}`);
}

console.log('\n✅ Password validation tests completed!'); 