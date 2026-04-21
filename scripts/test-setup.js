// Test script to verify the application setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Startup Kano Portfolio Setup...\n');

// Check if required files exist
const requiredFiles = [
  '.env.local',
  'lib/supabase.ts',
  'lib/types.ts',
  'lib/utils.ts',
  'contexts/AuthContext.tsx',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/auth/signup/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/admin/page.tsx'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking Dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const requiredDeps = [
  '@supabase/supabase-js',
  'lucide-react',
  'date-fns',
  'clsx',
  'sonner',
  'tailwind-merge',
  'next',
  'react',
  'typescript'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment file
console.log('\n🔧 Environment Configuration...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Environment variables configured');
    if (envContent.includes('your_supabase_project_url')) {
      console.log('⚠️  Please update .env.local with your actual Supabase credentials');
    }
  } else {
    console.log('❌ Environment variables missing');
  }
} else {
  console.log('❌ .env.local file missing');
}

console.log('\n🗄️  Database Setup...');
console.log('📝 Run these SQL files in your Supabase SQL editor:');
console.log('   1. supabase/migrations/001_initial_schema.sql');
console.log('   2. supabase/migrations/002_rls_policies.sql');
console.log('   3. supabase/migrations/003_auth_trigger.sql');

console.log('\n🚀 Next Steps:');
if (allFilesExist) {
  console.log('✅ All files are in place!');
  console.log('1. Update .env.local with your Supabase credentials');
  console.log('2. Run the SQL migrations in Supabase');
  console.log('3. Start the development server: npm run dev');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}

console.log('\n🧪 Test Accounts (Offline Mode):');
console.log('Admin: admin@startupkano.com / admin123');
console.log('Member: user@startupkano.com / user123');

console.log('\n✨ Setup verification complete!');