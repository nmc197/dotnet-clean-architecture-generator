#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * Auto Generate Project Script
 * Tự động thực hiện tất cả các bước generate project
 */

async function autoGenerateProject(projectName, sqlFilePath) {
  try {
    console.log(chalk.blue('🚀 Bắt đầu auto generate project...'));
    console.log(chalk.blue(`📁 Project: ${projectName}`));
    console.log(chalk.blue(`📄 SQL File: ${sqlFilePath}`));

    // Bước 1: Parse SQL sang JSON
    console.log(chalk.yellow('\n📋 Bước 1: Parse SQL sang JSON...'));
    
    if (!await fs.pathExists(sqlFilePath)) {
      throw new Error(`File SQL không tồn tại: ${sqlFilePath}`);
    }

    // Tạo file JSON từ SQL
    const jsonFileName = `${projectName.toLowerCase()}-entities.json`;
    const configsDir = 'configs';
    const jsonFilePath = path.join(configsDir, jsonFileName);
    
    // Tạo folder configs nếu chưa có
    if (!await fs.pathExists(configsDir)) {
      await fs.mkdir(configsDir);
      console.log(chalk.green(`✓ Tạo folder: ${configsDir}`));
    }
    
    // Kiểm tra nếu đã có file JSON tương ứng
    if (await fs.pathExists(jsonFilePath)) {
      console.log(chalk.green(`✓ Sử dụng file JSON có sẵn: ${jsonFilePath}`));
    } else {
      // Tự động parse SQL sang JSON
      console.log(chalk.blue('🔄 Tự động parse SQL sang JSON...'));
      
      if (sqlFilePath.includes('b05.sql')) {
        // Chạy simple-sql-parser.js để tạo b05-entities.json
        console.log(chalk.blue('🔄 Chạy simple-sql-parser.js...'));
        execSync('node simple-sql-parser.js', { stdio: 'inherit' });
        
        // Copy file đã tạo vào folder configs
        if (await fs.pathExists('b05-entities.json')) {
          await fs.copy('b05-entities.json', jsonFilePath);
          console.log(chalk.green(`✓ Copy từ b05-entities.json sang ${jsonFilePath}`));
          
          // Xóa file tạm thời ở root
          await fs.remove('b05-entities.json');
          console.log(chalk.green('✓ Xóa file tạm thời'));
        } else {
          throw new Error('Không thể tạo file b05-entities.json từ simple-sql-parser.js');
        }
      } else {
        throw new Error(`Chưa hỗ trợ parse file SQL: ${sqlFilePath}. Hiện tại chỉ hỗ trợ b05.sql.`);
      }
    }

    // Bước 2: Xóa project cũ (nếu có)
    console.log(chalk.yellow('\n📋 Bước 2: Xóa project cũ...'));
    const projectPath = `./${projectName}-Project`;
    
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
      console.log(chalk.green(`✓ Đã xóa project cũ: ${projectPath}`));
    } else {
      console.log(chalk.blue(`ℹ Không có project cũ để xóa`));
    }

    // Bước 3: Generate project
    console.log(chalk.yellow('\n📋 Bước 3: Generate project...'));
    const generateCommand = `node src/cli/index.js generate --config ${jsonFilePath} --output ./${projectName}-Project --project-name ${projectName}`;
    
    console.log(chalk.blue(`🔄 Chạy lệnh: ${generateCommand}`));
    execSync(generateCommand, { stdio: 'inherit' });
    console.log(chalk.green('✓ Project đã được generate thành công!'));

    // Bước 4: Setup wwwroot assets
    console.log(chalk.yellow('\n📋 Bước 4: Setup wwwroot assets...'));
    
    const sourcePath = path.join(__dirname, 'examples', 'wwwroot-example');
    const targetPath = path.join(__dirname, `${projectName}-Project`, `${projectName}.WebAdmin`, 'wwwroot');
    const adminTarget = path.join(targetPath, 'admin');

    if (await fs.pathExists(sourcePath)) {
      // Copy admin assets
      const adminSource = path.join(sourcePath, 'admin');

      // Copy CSS
      const cssSource = path.join(adminSource, 'assets', 'css');
      const cssTarget = path.join(adminTarget, 'assets', 'css');
      if (await fs.pathExists(cssSource)) {
        await fs.copy(cssSource, cssTarget, { overwrite: true });
        console.log(chalk.green('✓ CSS files copied'));
      }

      // Copy JS (except pages)
      const jsSource = path.join(adminSource, 'assets', 'js');
      const jsTarget = path.join(adminTarget, 'assets', 'js');
      
      if (await fs.pathExists(jsSource)) {
        // Copy custom, plugins, shared folders
        const foldersToCopy = ['custom', 'plugins', 'shared'];
        for (const folder of foldersToCopy) {
          const folderSource = path.join(jsSource, folder);
          const folderTarget = path.join(jsTarget, folder);
          if (await fs.pathExists(folderSource)) {
            await fs.copy(folderSource, folderTarget, { overwrite: true });
            console.log(chalk.green(`✓ ${folder} JS files copied`));
          }
        }

        // Copy bundle files
        const bundleFiles = ['scripts.bundle.js', 'widgets.bundle.js'];
        for (const file of bundleFiles) {
          const fileSource = path.join(jsSource, file);
          const fileTarget = path.join(jsTarget, file);
          if (await fs.pathExists(fileSource)) {
            await fs.copy(fileSource, fileTarget, { overwrite: true });
          }
        }
        console.log(chalk.green('✓ Bundle JS files copied'));
      }

      // Copy media and plugins
      const mediaSource = path.join(adminSource, 'assets', 'media');
      const mediaTarget = path.join(adminTarget, 'assets', 'media');
      if (await fs.pathExists(mediaSource)) {
        await fs.copy(mediaSource, mediaTarget, { overwrite: true });
        console.log(chalk.green('✓ Media files copied'));
      }

      const pluginsSource = path.join(adminSource, 'assets', 'plugins');
      const pluginsTarget = path.join(adminTarget, 'assets', 'plugins');
      if (await fs.pathExists(pluginsSource)) {
        await fs.copy(pluginsSource, pluginsTarget, { overwrite: true });
        console.log(chalk.green('✓ Plugin assets copied'));
      }

      // Copy index.html
      const indexSource = path.join(adminSource, 'assets', 'index.html');
      const indexTarget = path.join(adminTarget, 'assets', 'index.html');
      if (await fs.pathExists(indexSource)) {
        await fs.copy(indexSource, indexTarget, { overwrite: true });
        console.log(chalk.green('✓ Index.html copied'));
      }
    }

    // Bước 5: Dọn dẹp pages folder
    console.log(chalk.yellow('\n📋 Bước 5: Dọn dẹp pages folder...'));
    
    const pagesPath = path.join(adminTarget, 'assets', 'js', 'pages');
    
    // Đọc entities từ JSON để biết cần giữ folder nào
    const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
    const config = JSON.parse(jsonContent);
    const ourEntities = config.entities.map(e => e.name.toLowerCase());

    // Dọn dẹp pages folder
    const folders = await fs.readdir(pagesPath);
    let keptCount = 0;
    let removedCount = 0;

    for (const folder of folders) {
      const folderPath = path.join(pagesPath, folder);
      const stat = await fs.stat(folderPath);
      
      if (stat.isDirectory()) {
        if (ourEntities.includes(folder.toLowerCase())) {
          console.log(chalk.green(`✓ Giữ lại: ${folder}`));
          keptCount++;
        } else {
          await fs.remove(folderPath);
          console.log(chalk.yellow(`🗑️ Xóa: ${folder}`));
          removedCount++;
        }
      }
    }

    // Bước 6: Thống kê kết quả
    console.log(chalk.yellow('\n📋 Bước 6: Thống kê kết quả...'));
    
    const countFiles = async (dir) => {
      let count = 0;
      const items = await fs.readdir(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          count += await countFiles(itemPath);
        } else {
          count++;
        }
      }
      return count;
    };

    const totalFiles = await countFiles(adminTarget);
    
    console.log(chalk.green('\n🎉 HOÀN THÀNH!'));
    console.log(chalk.blue(`📊 Project: ${projectName}`));
    console.log(chalk.blue(`📁 Output: ${projectPath}`));
    console.log(chalk.blue(`📄 Entities: ${config.entities.length}`));
    console.log(chalk.blue(`📁 Pages folders giữ lại: ${keptCount}`));
    console.log(chalk.blue(`🗑️ Pages folders đã xóa: ${removedCount}`));
    console.log(chalk.blue(`📊 Total files trong wwwroot/admin: ${totalFiles}`));

    console.log(chalk.green('\n✅ Project đã sẵn sàng sử dụng!'));
    console.log(chalk.blue('📖 Xem file HUONG_DAN_GENERATE_PROJECT.txt để biết thêm chi tiết'));

  } catch (error) {
    console.error(chalk.red('❌ Lỗi trong quá trình generate:'), error.message);
    process.exit(1);
  }
}

// Hàm hiển thị hướng dẫn sử dụng
function showUsage() {
  console.log(chalk.blue('📖 HƯỚNG DẪN SỬ DỤNG:'));
  console.log(chalk.white('node auto-generate-project.js <project-name> <sql-file-path>'));
  console.log(chalk.white(''));
  console.log(chalk.yellow('Ví dụ:'));
  console.log(chalk.white('node auto-generate-project.js MyProject ./my-schema.sql'));
  console.log(chalk.white('node auto-generate-project.js DionB05 ./examples/b05.sql'));
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  showUsage();
  process.exit(1);
}

const projectName = args[0];
const sqlFilePath = args[1];

autoGenerateProject(projectName, sqlFilePath);
