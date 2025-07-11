const API_BASE = 'http://localhost:3001';

// Test data
const testTrainer = {
  email: 'jonflack@gmail.com',
  password: 'password123'
};

const testClient = {
  email: 'sarah.johnson@email.com',
  password: 'password123'
};

let trainerToken = '';
let clientToken = '';
let trainerId = '';

async function testEndpoint(name, fn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    const result = await fn();
    console.log(`✅ ${name}: PASS`);
    return { success: true, result };
  } catch (error) {
    console.log(`❌ ${name}: FAIL - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response;
}

async function runTests() {
  console.log('🚀 Starting API Regression Tests...\n');
  
  const results = [];
  
  // Test 1: Trainer Login
  const loginResult = await testEndpoint('Trainer Login', async () => {
    const response = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(testTrainer)
    });
    const data = await response.json();
    trainerToken = data.token;
    trainerId = data.user.id;
    return data;
  });
  results.push(loginResult);
  
  // Test 2: Client Login
  const clientLoginResult = await testEndpoint('Client Login', async () => {
    const response = await makeRequest(`${API_BASE}/api/auth/client-login`, {
      method: 'POST',
      body: JSON.stringify(testClient)
    });
    const data = await response.json();
    clientToken = data.token;
    return data;
  });
  results.push(clientLoginResult);
  
  // Test 3: Get Sessions (Trainer)
  const sessionsResult = await testEndpoint('Get Sessions (Trainer)', async () => {
    const response = await makeRequest(`${API_BASE}/api/sessions?role=trainer`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(sessionsResult);
  
  // Test 4: Get Sessions (Client)
  const clientSessionsResult = await testEndpoint('Get Sessions (Client)', async () => {
    const response = await makeRequest(`${API_BASE}/api/sessions?role=client`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    return await response.json();
  });
  results.push(clientSessionsResult);
  
  // Test 5: Get Clients
  const clientsResult = await testEndpoint('Get Clients', async () => {
    const response = await makeRequest(`${API_BASE}/api/clients`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(clientsResult);
  
  // Test 6: Get Availability
  const availabilityResult = await testEndpoint('Get Availability', async () => {
    const response = await makeRequest(`${API_BASE}/api/availability`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(availabilityResult);
  
  // Test 7: Get Available Slots
  const slotsResult = await testEndpoint('Get Available Slots', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];
    
    const response = await makeRequest(`${API_BASE}/api/availability/slots?trainerId=${trainerId}&date=${date}`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    return await response.json();
  });
  results.push(slotsResult);
  
  // Test 8: Calendar Export (Trainer)
  const exportResult = await testEndpoint('Calendar Export (Trainer)', async () => {
    const response = await makeRequest(`${API_BASE}/api/sessions/export?format=ical`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    const text = await response.text();
    return { contentType: response.headers.get('content-type'), length: text.length };
  });
  results.push(exportResult);
  
  // Test 9: Calendar Export (Client)
  const clientExportResult = await testEndpoint('Calendar Export (Client)', async () => {
    const response = await makeRequest(`${API_BASE}/api/sessions/export?format=ical`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    const text = await response.text();
    return { contentType: response.headers.get('content-type'), length: text.length };
  });
  results.push(clientExportResult);
  
  // Test 10: Create Session
  const createSessionResult = await testEndpoint('Create Session', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const sessionData = {
      clientId: '5f912a64-400a-4559-be57-6f64740c1713', // Actual client ID from seed
      startTime: tomorrow.toISOString(),
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
      type: 'IN_PERSON',
      location: 'Gym',
      notes: 'Test session'
    };
    
    const response = await makeRequest(`${API_BASE}/api/sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${trainerToken}` },
      body: JSON.stringify(sessionData)
    });
    return await response.json();
  });
  results.push(createSessionResult);
  
  // Test 11: Update Session
  const updateSessionResult = await testEndpoint('Update Session', async () => {
    if (!createSessionResult.success) {
      throw new Error('Skipped - no session created');
    }
    
    const sessionId = createSessionResult.result.id;
    const updateData = {
      notes: 'Updated test session'
    };
    
    const response = await makeRequest(`${API_BASE}/api/sessions?id=${sessionId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${trainerToken}` },
      body: JSON.stringify(updateData)
    });
    return await response.json();
  });
  results.push(updateSessionResult);
  
  // Test 12: Delete Session
  const deleteSessionResult = await testEndpoint('Delete Session', async () => {
    if (!createSessionResult.success) {
      throw new Error('Skipped - no session created');
    }
    
    const sessionId = createSessionResult.result.id;
    const response = await makeRequest(`${API_BASE}/api/sessions?id=${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return { status: response.status };
  });
  results.push(deleteSessionResult);
  
  // Test 13: Get Assessments
  const assessmentsResult = await testEndpoint('Get Assessments', async () => {
    const response = await makeRequest(`${API_BASE}/api/assessments`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(assessmentsResult);
  
  // Test 14: Get Progress
  const progressResult = await testEndpoint('Get Progress', async () => {
    const response = await makeRequest(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(progressResult);
  
  // Test 15: Get Programs
  const programsResult = await testEndpoint('Get Programs', async () => {
    const response = await makeRequest(`${API_BASE}/api/programs`, {
      headers: { Authorization: `Bearer ${trainerToken}` }
    });
    return await response.json();
  });
  results.push(programsResult);
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  ${index + 1}. ${result.error}`);
      }
    });
  }
  
  console.log('\n🎉 API Regression Testing Complete!');
  
  return { passed, failed, total: results.length };
}

// Run the tests
runTests().catch(console.error); 