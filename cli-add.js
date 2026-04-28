import fetch from 'node-fetch';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('❌ Error: Missing arguments!');
  console.log('✅ Usage: node cli-add.js "Product Name" <price> [category] [image_url]');
  console.log('Example: node cli-add.js "Rolex Watch" 499.99 "Men" "https://image.jpg"');
  process.exit(1);
}

const [name, price, category = 'General', image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'] = args;

async function addProduct() {
  try {
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        price: Number(price), 
        category, 
        image, 
        description: 'Auto-added from Terminal CLI' 
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`\n🎉 SUCCESS! Product [${data.name}] added to DB!`);
      console.log(`🆔 Save this Product ID in case you want to delete it: ${data._id}\n`);
    } else {
      console.log('❌ Failed:', data);
    }
  } catch (err) {
    console.log('❌ Network Error: Make sure your backend server is running on port 5000!');
  }
}

addProduct();
