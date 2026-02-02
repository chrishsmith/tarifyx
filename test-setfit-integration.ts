/**
 * Test script to verify SetFit integration with V10 engine
 * 
 * Usage:
 *   npx tsx test-setfit-integration.ts
 */

import { classifyV10 } from './src/services/classification/engine-v10.js';

async function testSetFitIntegration() {
  console.log('=== Testing SetFit Integration with V10 Engine ===\n');
  
  const testProducts = [
    'cotton t-shirt',
    'plastic water bottle',
    'leather wallet',
  ];
  
  for (const product of testProducts) {
    console.log(`\nTesting: "${product}"`);
    console.log('─'.repeat(60));
    
    try {
      const result = await classifyV10({
        description: product,
        origin: 'CN',
        useSetFit: true,
      });
      
      if (result.success && result.primary) {
        console.log(`✅ Success!`);
        console.log(`   HTS Code: ${result.primary.htsCodeFormatted}`);
        console.log(`   Confidence: ${result.primary.confidence}%`);
        console.log(`   Description: ${result.primary.shortDescription}`);
        console.log(`   SetFit Used: ${result.setfitUsed ? 'Yes' : 'No'}`);
        if (result.setfitLatency) {
          console.log(`   SetFit Latency: ${result.setfitLatency}ms`);
        }
        console.log(`   Total Time: ${result.timing.total}ms`);
      } else {
        console.log(`❌ Classification failed`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }
  
  console.log('\n=== Test Complete ===');
}

testSetFitIntegration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
