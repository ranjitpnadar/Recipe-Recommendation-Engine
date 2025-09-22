const prisma = require('../config/prismaClient'); // Import Prisma Client
const bcrypt = require('bcryptjs'); // Still needed for password hashing

class UserService {
    static async createUser(userData) {
        try {
            // Hash password before creating user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password_hash, salt);

            const user = await prisma.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    passwordHash: hashedPassword, // Use passwordHash as per Prisma schema
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    profilePictureUrl: userData.profile_picture_url,
                    // createdAt and updatedAt are handled by Prisma's @default(now()) and @updatedAt
                    // isActive is handled by Prisma's @default(true)
                },
                select: { // Select specific fields to return, excluding passwordHash
                    userId: true,
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    isActive: true,
                }
            });
            return user;
        } catch (error) {
           if (error.code === 'P2002') { // Prisma error code for unique constraint violation
                throw new Error('Username or email already exists.');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    static async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { userId: userId },
                select: { // Exclude passwordHash
                    userId: true,
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    isActive: true,
                }
            });
            if (!user) {
                throw new Error('User not found.');
            }
            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    static async getUserByEmail(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
            });
            return user; // Returns full user object including passwordHash for auth
        } catch (error) {
            throw new Error(`Error fetching user by email: ${error.message}`);
        }
    }

    static async updateUser(userId, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password_hash) {
                const salt = await bcrypt.genSalt(10);
                updateData.passwordHash = await bcrypt.hash(updateData.password_hash, salt);
                delete updateData.password_hash; // Remove original field
            }

            const user = await prisma.user.update({
                where: { userId: userId },
                data: {
                    username: updateData.username,
                    email: updateData.email,
                    passwordHash: updateData.passwordHash, // Will be undefined if not updated
                    firstName: updateData.first_name,
                    lastName: updateData.last_name,
                    profilePictureUrl: updateData.profile_picture_url,
                    isActive: updateData.is_active,
                },
                select: { // Exclude passwordHash
                    userId: true,
                    username: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    isActive: true,
                }
            });
            return user;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async deleteUser(userId) {
        try {
            const user = await prisma.user.delete({
                where: { userId: userId },
            });
            if (!user) { // Prisma throws an error if not found, so this check might be redundant
                throw new Error('User not found.');
            }
            return { message: 'User deleted successfully.' };
        } catch (error) {
            if (error.code === 'P2025') { // Prisma error code for record not found
                throw new Error('User not found.');
            }
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}

module.exports = UserService;