import crypto from 'crypto';

// Generate a random 64-byte key and convert it to hex
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('Generated JWT Secret Key:');
console.log(jwtSecret); 