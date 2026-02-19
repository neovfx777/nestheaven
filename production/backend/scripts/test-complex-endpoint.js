/**
 * Test script to check if the complex creation endpoint is working
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'manager@nestheaven.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Admin123!';

async function testComplexEndpoint() {
  try {
    console.log('🧪 Testing Complex Creation Endpoint...\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      console.error('❌ Failed to get token from login response:', loginResponse.data);
      return;
    }
    console.log('✅ Login successful\n');

    // Step 2: Test endpoint with minimal data
    console.log('2. Testing POST /api/complexes with minimal data...');
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('title', JSON.stringify({
      uz: 'Test Complex',
      ru: 'Test Complex',
      en: 'Test Complex',
    }));
    formData.append('city', 'Tashkent');
    formData.append('developer', 'Test Developer');
    formData.append('blockCount', '1');
    formData.append('location', JSON.stringify({
      lat: 41.3111,
      lng: 69.2797,
      address: {
        uz: 'Test Address',
        ru: 'Test Address',
        en: 'Test Address',
      },
    }));

    try {
      const createResponse = await axios.post(`${API_URL}/complexes`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log('✅ Complex created successfully!');
      console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Failed to create complex:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No response received:', error.message);
        console.error('Is the server running?');
      } else {
        console.error('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testComplexEndpoint();
