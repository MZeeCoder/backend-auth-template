import authService from './services.js';

class AuthController {
    /**
     * Sign up a new user
     */
    async signUp(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            // Prepare metadata
            const metadata = {};
            if (username) metadata.username = username;

            const result = await authService.signUp(email, password, metadata);

            return res.status(201).json(result);
        } catch (error) {
            console.error('Sign up error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Sign up failed',
                error: error.error
            });
        }
    }

    /**
     * Log in an existing user
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await authService.login(email, password);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Login error:', error);
            return res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
                error: error.error
            });
        }
    }

    /**
     * Login with magic link
     * Sends a magic link to the user's email
     */
    async loginWithMagicLink(req, res) {
        try {
            const { email } = req.body;

            // Validation
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await authService.loginWithMagicLink(email);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Magic link login error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to send magic link',
                error: error.error
            });
        }
    }

    /**
     * Confirm email with access token from frontend
     * This handles the Supabase confirmation flow
     */
    async confirmEmail(req, res) {
        try {
            const { accessToken, refreshToken } = req.body;

            // Validation
            if (!accessToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Access token is required'
                });
            }

            const result = await authService.confirmEmailWithToken(accessToken);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Email confirmation error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Email confirmation failed',
                error: error.error
            });
        }
    }

    /**
     * Verify email with OTP
     */
    async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            // Validation
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and token are required'
                });
            }

            const result = await authService.verifyEmail(token);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Email verification error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Email verification failed',
                error: error.error
            });
        }
    }

    /**
     * Resend confirmation email
     */
    async resendConfirmation(req, res) {
        try {
            const { email } = req.body;

            // Validation
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await authService.resendConfirmation(email);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Resend confirmation error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to resend confirmation email',
                error: error.error
            });
        }
    }

    /**
     * Log out user
     */
    async logout(req, res) {
        try {
            const accessToken = req.headers.authorization?.replace('Bearer ', '');

            if (!accessToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Access token is required'
                });
            }

            const result = await authService.logout(accessToken);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Logout failed',
                error: error.error
            });
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(req, res) {
        try {

            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized user'
                });
            }

            const result = await authService.getUserProfile(userId);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Get current user error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to get user',
                error: error.error
            });
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const result = await authService.refreshToken(refreshToken);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Token refresh failed',
                error: error.error
            });
        }
    }

    /**
     * Request password reset
     */
    async resetPasswordRequest(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const result = await authService.resetPasswordRequest(email);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Password reset request error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to send password reset email',
                error: error.error
            });
        }
    }

    /**
     * Update password
     */
    async updatePassword(req, res) {
        try {
            const { newPassword } = req.body;
            const accessToken = req.headers.authorization?.replace('Bearer ', '');

            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password is required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            const result = await authService.updatePassword(accessToken, newPassword);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Update password error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Password update failed',
                error: error.error
            });
        }
    }

    async generateDefaultAvatar(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized user'
                });
            }

            const result = await authService.createDefaultAvatar(userId);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Generate default avatar error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to generate default avatar',
                error: error.error
            });
        }
    }

    async uploadAvatar(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized user'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar file is required'
                });
            }

            const result = await authService.uploadAvatar(userId, req.file);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Upload avatar error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to upload avatar',
                error: error.error
            });
        }
    }

    async clearAvatar(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized user'
                });
            }

            const result = await authService.clearAvatar(userId);
            return res.status(200).json(result);
        } catch (error) {
            console.error('Clear avatar error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to clear avatar',
                error: error.error
            });
        }
    }
}

const authController = new AuthController();
export default authController;
