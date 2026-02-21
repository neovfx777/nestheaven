const axios = require('axios');
const FormData = require('form-data');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'manager@nestheaven.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD;

if (!TEST_PASSWORD) {
  console.error('TEST_PASSWORD is required');
  process.exit(1);
}

async function testComplexEndpoint() {
  try {
    console.log('Testing complex creation endpoint...');

    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      console.error('Failed to get token from login response');
      process.exit(1);
    }

    const formData = new FormData();
    formData.append(
      'title',
      JSON.stringify({
        uz: 'Test Complex',
        ru: 'Test Complex',
        en: 'Test Complex',
      })
    );
    formData.append('city', 'Tashkent');
    formData.append('developer', 'Test Developer');
    formData.append('blockCount', '1');
    formData.append(
      'location',
      JSON.stringify({
        lat: 41.3111,
        lng: 69.2797,
        address: {
          uz: 'Test Address',
          ru: 'Test Address',
          en: 'Test Address',
        },
      })
    );

    const createResponse = await axios.post(`${API_URL}/complexes`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('Complex creation test succeeded');
    console.log(JSON.stringify(createResponse.data, null, 2));
  } catch (error) {
    console.error('Complex creation test failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testComplexEndpoint();
