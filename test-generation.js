const CodeGenerator = require('./src/generator');
const path = require('path');

async function testGeneration() {
  console.log('🧪 Testing Code Generation...\n');

  const generator = new CodeGenerator();
  
  // Test configuration
  const testConfig = {
    projectName: 'TestProject',
    entities: [
      {
        name: 'Product',
        properties: [
          { name: 'Id', type: 'int', isPrimaryKey: true },
          { name: 'Name', type: 'string', isRequired: true },
          { name: 'Description', type: 'string', isRequired: false },
          { name: 'Price', type: 'decimal', isRequired: true },
          { name: 'CreatedDate', type: 'DateTime', isRequired: true },
          { name: 'IsDeleted', type: 'bool', isRequired: true, defaultValue: 'false' }
        ],
        relationships: []
      },
      {
        name: 'Category',
        properties: [
          { name: 'Id', type: 'int', isPrimaryKey: true },
          { name: 'Name', type: 'string', isRequired: true },
          { name: 'Description', type: 'string', isRequired: false },
          { name: 'CreatedDate', type: 'DateTime', isRequired: true },
          { name: 'IsDeleted', type: 'bool', isRequired: true, defaultValue: 'false' }
        ],
        relationships: []
      }
    ]
  };

  const outputPath = path.join(__dirname, 'TestOutput');

  try {
    console.log('🚀 Starting generation...');
    const result = await generator.generateProject(testConfig, outputPath, testConfig.projectName);
    
    if (result.success) {
      console.log('\n✅ Generation completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Total files: ${result.summary.totalFiles}`);
      console.log(`   - Successful: ${result.summary.successfulFiles}`);
      console.log(`   - Failed: ${result.summary.failedFiles}`);
      console.log(`   - Success rate: ${result.summary.successRate}%`);
      
      console.log('\n📁 Generated structure:');
      console.log(`   - ${testConfig.projectName}.Domain`);
      console.log(`   - ${testConfig.projectName}.Application`);
      console.log(`   - ${testConfig.projectName}.Infrastructure`);
      console.log(`   - ${testConfig.projectName}.API`);
      console.log(`   - ${testConfig.projectName}.Shared`);
      console.log(`   - ${testConfig.projectName}.Storage`);
      console.log(`   - ${testConfig.projectName}.WebAdmin`);
      
    } else {
      console.log('\n❌ Generation failed!');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
  }
}

// Run the test
testGeneration();
