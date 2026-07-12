const { verifyAccessToken } = require('../utils/jwt');
const redisClient = require('../config/redis');

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const isBlacklisted = await redisClient.get(`bl_${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }

        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, email: payload.email };
        req.token = token;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;
