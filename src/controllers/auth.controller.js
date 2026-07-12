const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { signAccessToken, verifyAccessToken } = require('../utils/jwt');
const redisClient = require('../config/redis');
const roleModel = require('../models/role.model');

const SALT_ROUNDS = 10;
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'name, email, password and role are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'password must be at least 6 characters' });
        }
        const validRole = await roleModel.findRoleByName(role);
        if (!validRole) {
            const roles = await roleModel.listRoles();
            return res.status(400).json({ message: `role must be one of: ${roles.map((r) => r.name).join(', ')}` });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await userModel.findUserByEmail(normalizedEmail);
        if (existing) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await userModel.createUser({ name, email: normalizedEmail, passwordHash, role });

        return res.status(201).json({ user });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE_MS,
        });

        return res.status(200).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

async function logout(req, res) {
    try {
        const token = req.token;
        const payload = verifyAccessToken(token);
        const expiresInSeconds = payload.exp - Math.floor(Date.now() / 1000);

        if (expiresInSeconds > 0) {
            await redisClient.set(`bl_${token}`, '1', { EX: expiresInSeconds });
        }

        res.clearCookie('token');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

async function me(req, res) {
    const user = await userModel.findUserById(req.user.id);
    return res.status(200).json({ user });
}

module.exports = { register, login, logout, me };
