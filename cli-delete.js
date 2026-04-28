import fetch from 'node-fetch';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('❌ Error: Missing Product ID!');
  console.log('✅ Usage: node cli-delete.js <ProductID>');
  console.log('Example: node cli-delete.js 64b3f...a2');
  process.exit(1);
}

const productId = args[0];

async function deleteProduct() {
  try {
    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`\n💥 SUCCESS! Product [${productId}] has been vaporized from the Database!\n`);
    } else {
      console.log('❌ Failed to delete:', data.message || 'Product not found.');
    }
  } catch (err) {
    console.log('❌ Network Error: Make sure your backend server is running on port 5000!');
  }
}

deleteProduct();
