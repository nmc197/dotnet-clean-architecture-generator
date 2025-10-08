const CodeGenerator = require('./src/generator');
const FileUtils = require('./src/utils/file-utils');
const path = require('path');

async function testGenerator() {
  try {
    console.log('🧪 Testing .NET Clean Architecture Generator...\n');

    // Test configuration
    const testConfig = {
      projectName: 'TestProject',
      entities: [
        {
          name: 'Product',
          properties: [
            {
              name: 'Name',
              type: 'string',
              isRequired: true,
              maxLength: 100
            },
            {
              name: 'Price',
              type: 'decimal',
              isRequired: true
            },
            {
              name: 'CategoryId',
              type: 'int',
              isRequired: true,
              isForeignKey: true,
              relatedEntity: 'Category'
            }
          ],
          relationships: [
            {
              type: 'navigation',
              relatedEntity: 'Category',
              isCollection: false
            }
          ]
        }
      ]
    };

    // Create output directory
    const outputPath = './test-output';
    await FileUtils.ensureDirectoryExists(outputPath);

    // Initialize generator
    const generator = new CodeGenerator();
    
    // Generate project
    console.log('🔄 Generating test project...');
    const result = await generator.generateProject(testConfig, outputPath, 'TestProject');
    
    if (result.success) {
      console.log('✅ Test passed!');
      console.log(`📁 Output: ${path.resolve(outputPath)}`);
      console.log(`📊 Generated ${result.summary.totalFiles} files`);
      console.log(`📈 Success rate: ${result.summary.successRate}%`);
    } else {
      console.log('❌ Test failed!');
      if (result.errors) {
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    }

    // Clean up
    console.log('\n🧹 Cleaning up test files...');
    await FileUtils.removeDirectory(outputPath);
    console.log('✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run test
testGenerator();
