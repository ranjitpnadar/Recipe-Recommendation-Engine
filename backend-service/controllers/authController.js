// controllers/authController.js
const AuthService = require('../services/authService');
const errorHandler = require('../utils/errorHandler');

class AuthController {
    static async register(req, res) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json({ status:"success", message: 'User registered successfully.', user });
        } catch (error) {
            errorHandler(res, error, 400);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(email, password);
            res.status(200).json({ status:"success", message: 'Logged in successfully.', token, user });
        } catch (error) {
            errorHandler(res, error, 401);
        }
    }
}

module.exports = AuthController;