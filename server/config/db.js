const mongoose = require('mongoose');

const getMongoUri = () => {
  const mongoUri = process.env.MONGO_URI;
  const seedHosts = process.env.MONGO_SEED_HOSTS;

  if (!mongoUri || !seedHosts || !mongoUri.startsWith('mongodb+srv://')) {
    return mongoUri;
  }

  const match = mongoUri.match(/^mongodb\+srv:\/\/([^/]+)(\/.*)?$/);
  if (!match) {
    return mongoUri;
  }

  const hosts = seedHosts.split(',').map((host) => host.trim()).filter(Boolean).join(',');
  const suffix = match[2] || '/';
  const separator = suffix.includes('?') ? '&' : '?';

  return `mongodb://${match[1].replace(/@[^@]+$/, `@${hosts}`)}${suffix}${separator}tls=true&authSource=admin&replicaSet=${process.env.MONGO_REPLICA_SET || ''}`;
};

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Reason:', error.reason);

    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

module.exports = connectDB;