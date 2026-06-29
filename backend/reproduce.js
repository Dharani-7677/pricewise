// backend/reproduce.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabase = require('./models/supabase');

async function testInsert() {
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'Not Loaded');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'Not Loaded');

  const testProduct = {
    url: 'https://www.amazon.in/dp/B0CHX1W1XY',
    name: 'Test Product ' + Date.now(),
    platform: 'amazon',
    current_price: 999,
    original_price: 1499,
    image_url: 'https://example.com/image.png',
    user_id: 'guest'
  };

  try {
    console.log('Inserting test product:', testProduct);
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    console.log('Supabase Response:');
    console.log('Error:', error);
    console.log('Data:', data);

    if (data && data.length > 0) {
      console.log('Successfully inserted! ID:', data[0].id);
    } else {
      console.log('Insert returned empty data array!');
    }
  } catch (err) {
    console.error('Unhandled Error:', err);
  }
}

testInsert();
