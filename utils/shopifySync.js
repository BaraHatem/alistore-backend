import fetch from 'node-fetch';
import Product from '../models/Product.js';
import Collection from '../models/Collection.js';
import dotenv from 'dotenv';

dotenv.config();

const domain = process.env.SHOPIFY_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

export const syncWithShopify = async () => {
  console.log('🔄 Starting Shopify Sync...');

  const query = `
    {
      collections(first: 50) {
        edges {
          node {
            id
            handle
            title
            description
            image { url }
            products(first: 10) {
              edges {
                node {
                  images(first: 1) {
                    edges {
                      node { url }
                    }
                  }
                }
              }
            }
          }
        }
      }
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            collections(first: 10) {
               edges {
                 node {
                   title
                 }
               }
            }
            variants(first: 1) {
              edges {
                node {
                  price { amount }
                  compareAtPrice { amount }
                }
              }
            }
            images(first: 1) {
              edges {
                node { url }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const URL = `https://${domain}/api/2024-01/graphql.json`;
    const options = {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    };

    const response = await fetch(URL, options);
    const result = await response.json();

    if (result.errors) {
      console.error("❌ Shopify API Errors:", result.errors);
      return;
    }

    const collectionsData = result.data.collections.edges;
    const productsData = result.data.products.edges;

    // Clear existing data
    await Product.deleteMany({});
    await Collection.deleteMany({});

    // 1. Process Collections
    const seenColTitles = new Set();
    for (let i = 0; i < collectionsData.length; i++) {
      const { node: col } = collectionsData[i];
      if (seenColTitles.has(col.title)) continue;
      seenColTitles.add(col.title);

      const productImages = col.products?.edges
        ?.map(e => e.node.images?.edges[0]?.node?.url)
        ?.filter(Boolean) || [];
      
      const imageOffset = i % (productImages.length || 1);
      const fallbackImage = productImages[imageOffset] || productImages[0] || '';
      
      await Collection.create({
        shopifyId: col.id,
        handle: col.handle,
        title: col.title,
        description: col.description,
        image: col.image?.url || fallbackImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        productCount: 0 
      });
    }

    // 2. Process All Products
    let productCountPerCol = {};

    for (const { node: prod } of productsData) {
      const shopifyId = prod.id;
      const type = prod.productType ? prod.productType.toLowerCase() : '';
      const productCollections = prod.collections.edges.map(e => e.node.title.toLowerCase());
      
      // Update collection product counts
      prod.collections.edges.forEach(e => {
        const colTitle = e.node.title;
        productCountPerCol[colTitle] = (productCountPerCol[colTitle] || 0) + 1;
      });

      await Product.create({
        shopifyId: prod.id,
        handle: prod.handle,
        name: prod.title,
        description: prod.description,
        category: prod.collections.edges[0]?.node?.title || prod.productType || 'General',
        allCategories: [...productCollections, type].filter(Boolean),
        price: parseFloat(prod.variants.edges[0]?.node?.compareAtPrice?.amount || prod.variants.edges[0]?.node?.price?.amount || 0),
        salePrice: prod.variants.edges[0]?.node?.compareAtPrice ? parseFloat(prod.variants.edges[0].node.price.amount) : null,
        image: prod.images.edges[0]?.node?.url || 'https://via.placeholder.com/400',
        rating: 5,
        numReviews: Math.floor(Math.random() * 85) + 15
      });
    }

    // 3. Update Collection Product Counts
    for (const colTitle in productCountPerCol) {
      await Collection.updateOne(
        { title: colTitle },
        { $set: { productCount: productCountPerCol[colTitle] } }
      );
    }

    console.log(`✅ Shopify Sync Complete! Synced ${collectionsData.length} collections and ${productsData.length} products.`);
  } catch (error) {
    console.error("❌ Network error during Shopify sync:", error);
  }
};
