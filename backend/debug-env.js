require('dotenv').config();

console.log('Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

console.log('\nFirebase variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Found' : '❌ Missing');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Found' : '❌ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Found' : '❌ Missing');

console.log('\nAuth0 variables:');
console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN ? '✅ Found' : '❌ Missing');
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID ? '✅ Found' : '❌ Missing');
console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? '✅ Found' : '❌ Missing');

console.log('\nOther variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Found' : '❌ Missing');

console.log('\nAll environment variables starting with FIREBASE or AUTH0:');
Object.keys(process.env)
  .filter(key => key.startsWith('FIREBASE') || key.startsWith('AUTH0') || key.startsWith('JWT'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  });
