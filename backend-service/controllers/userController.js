// controllers/userController.js
const UserService = require('../services/userService');
const errorHandler = require('../utils/errorHandler');

class UserController {
    static async getUserProfile(req, res) {
        try {
            console.log(req.user)
            const user = await UserService.getUserById(req.user.userId);
            res.status(200).json({ status:"success", message: 'Profile detail retrieved successfully.', user });
        } catch (error) {
            errorHandler(res, error, 404);
        }
    }

    static async updateUserProfile(req, res) {
        try {
            const user = await UserService.updateUser(req.user.userId, req.body);
            res.status(200).json({ status:"success", message: 'Profile updated successfully.', user });
        } catch (error) {
            errorHandler(res, error, 400);
        }
    }

    static async deleteUser(req, res) {
        try {
            await UserService.deleteUser(req.user.userId);
            res.status(200).json({ status:"success", message: 'User deleted successfully.' });
        } catch (error) {
            errorHandler(res, error, 500);
        }
    }
}

module.exports = UserController;