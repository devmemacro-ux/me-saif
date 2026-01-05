export const config = {
    port: parseInt(process.env.PORT || '3001'),
    jwtSecret: process.env.JWT_SECRET || 'fayez-store-secret-key-change-in-production',
    jwtExpiry: '7d',
    cookieName: 'fayez_token',
    dbPath: process.env.DB_PATH || './data/store.db'
};
