const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./Smart_loan_analyzer_backend-main/models/User');

async function testVoice() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart-loan-analyzer');
  const user = await User.findOne();
  if (!user) {
    console.log('No users found in database');
    process.exit(1);
  }

  try {
    const res = await axios.post('http://localhost:5000/api/voice/intent', {
      intent: 'GetLoanSummary',
      userId: user._id.toString()
    });
    console.log('Response from Voice Assistant API:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
  process.exit(0);
}

testVoice();
