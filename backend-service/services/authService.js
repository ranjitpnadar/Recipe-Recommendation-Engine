// services/authService.js
const UserService = require('./userService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class AuthService {
    static async register(userData) {
        return UserService.createUser(userData);
    }

    static async login(email, password) {
        const user = await UserService.getUserByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials.');
        }

        // Compare password using bcrypt
        const isMatch = await bcrypt.compare(password, user.passwordHash); // Use user.passwordHash
        if (!isMatch) {
            throw new Error('Invalid credentials.');
        }

        const token = jwt.sign(
            { userId: user.userId, email: user.email }, // Use userId as per Prisma schema
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token, user: { userId: user.userId, username: user.username, email: user.email } };
    }
}

module.exports = AuthService;