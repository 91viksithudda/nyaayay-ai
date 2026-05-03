const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Viksit Hudda',
      email: 'viksithudda91@gmail.com',
      password: 'password123'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', err.response?.data);
  }
}

test();
