import { supabase, supabaseAdmin } from '../../config/supabase.js';
import config from '../../config/config.js';

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || 'avatars';

class AuthService {
    buildInitialAvatar(username = 'U') {
        const initial = String(username).trim().charAt(0).toUpperCase() || 'U';
        return `https://ui-avatars.com/api/?name=${initial}&background=0D8ABC&color=fff&size=256`;
    }

    /**
     * Sign up a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {object} metadata - Additional user metadata
     * @returns {Promise<object>} User data and session
     */
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${config.api.frontendURL}/auth/confirm`
                }
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Sign up successful. Please check your email for confirmation.',
                user: {
                    id: data.user.id,
                    email: data.user.email
                }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Sign up failed',
                error
            };
        }
    }

    /**
     * Log in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} User data and session
     */
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Login successful',
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: {
                    id: data.user.id,
                    email: data.user.email
                }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Login failed',
                error
            };
        }
    }

    /**
     * Login with magic link
     * Sends a magic link to the user's email for passwordless login
     * @param {string} email - User email
     * @returns {Promise<object>} Result with message directing user to check email
     */
    async loginWithMagicLink(email) {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${config.api.frontendURL}/auth/confirm`
                }
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Magic link sent successfully. Please check your email to login.',
                email: email
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to send magic link',
                error
            };
        }
    }

    /**
     * Confirm email with access token from URL fragment
     * This is called after user clicks confirmation link and frontend extracts the token
     * @param {string} accessToken - Supabase access token from URL fragment
     * @returns {Promise<object>} User session
     */
    async confirmEmailWithToken(accessToken) {
        try {
            // Verify the Supabase access token
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

            if (error || !user) {
                throw new Error('Invalid or expired confirmation token');
            }

            // Check if email is confirmed
            if (!user.email_confirmed_at) {
                throw new Error('Email not confirmed');
            }

            // Get a fresh session for this user
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: accessToken // In real scenario, frontend should send both
            });

            return {
                success: true,
                message: 'Email confirmed successfully',
                accessToken: sessionData?.session?.access_token,
                refreshToken: sessionData?.session?.refresh_token,
                user: {
                    id: user.id,
                    email: user.email,
                    email_confirmed_at: user.email_confirmed_at
                }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Email confirmation failed',
                error
            };
        }
    }

    /**
    * Verify email with token
    * @param {string} token - verification token
    * @returns {Promise<object>} Verification result
    */

    async verifyEmail(token) {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                token,
                type: "signup"
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: "Email verified successfully",
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: {
                    id: data.user.id,
                    email: data.user.email
                }
            };

        } catch (error) {
            throw {
                success: false,
                message: error.message || "Email verification failed",
                error
            };
        }
    }

    /**
     * Resend confirmation email
     * @param {string} email - User email
     * @returns {Promise<object>} Result
     */
    async resendConfirmation(email) {
        try {
            const { data, error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${config.api.frontendURL}/auth/confirm`
                }
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Confirmation email sent successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to resend confirmation email',
                error
            };
        }
    }

    /**
     * Log out user
     * @param {string} accessToken - User access token
     * @returns {Promise<object>} Logout result
     */
    async logout(accessToken) {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Logout failed',
                error
            };
        }
    }

    /**
     * Get user by access token
     * @param {string} accessToken - User access token
     * @returns {Promise<object>} User data
     */
    async getUser(accessToken) {
        try {
            const { data, error } = await supabase.auth.getUser(accessToken);

            if (error) {
                throw error;
            }

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    username: data.user.user_metadata?.username || null,
                    avatar: data.user.user_metadata?.avatar || null,
                }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to get user',
                error
            };
        }
    }

    /**
     * Get full user profile from users table
     * @param {string} userId - Auth user id
     * @returns {Promise<object>} Full users table row
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                user: data
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to fetch user profile',
                error
            };
        }
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<object>} New session
     */
    async refreshToken(refreshToken) {
        try {
            const { data, error } = await supabase.auth.refreshSession({
                refresh_token: refreshToken
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Token refreshed successfully',
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Token refresh failed',
                error
            };
        }
    }

    /**
     * Reset password request
     * @param {string} email - User email
     * @returns {Promise<object>} Result
     */
    async resetPasswordRequest(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${config.api.frontendURL}/auth/reset-password`
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Password reset email sent successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to send password reset email',
                error
            };
        }
    }

    /**
     * Update password
     * @param {string} accessToken - User access token
     * @param {string} newPassword - New password
     * @returns {Promise<object>} Result
     */
    async updatePassword(accessToken, newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Password update failed',
                error
            };
        }
    }

    async createDefaultAvatar(userId) {
        try {
            const { data: profile, error: getError } = await supabaseAdmin
                .from('users')
                .select('id, username')
                .eq('id', userId)
                .single();

            if (getError || !profile) {
                throw getError || new Error('User profile not found');
            }

            const avatar = this.buildInitialAvatar(profile.username);

            const { data, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ avatar, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select('id, username, email, avatar')
                .single();

            if (updateError) {
                throw updateError;
            }

            return {
                success: true,
                message: 'Default avatar generated successfully',
                avatar: data.avatar
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to generate default avatar',
                error
            };
        }
    }

    async uploadAvatar(userId, file) {
        try {
            if (!file) {
                throw new Error('Avatar file is required');
            }

            const extension = (file.originalname?.split('.').pop() || 'png').toLowerCase();
            const fileName = `${userId}/${Date.now()}.${extension}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from(AVATAR_BUCKET)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicData } = supabaseAdmin.storage
                .from(AVATAR_BUCKET)
                .getPublicUrl(fileName);

            const avatar = publicData.publicUrl;

            const { data: updatedUser, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ avatar, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select('id, username, email, avatar')
                .single();

            if (updateError) {
                throw updateError;
            }

            return {
                success: true,
                message: 'Avatar updated successfully',
                avatar: updatedUser.avatar
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to upload avatar',
                error
            };
        }
    }

    async clearAvatar(userId) {
        try {
            const { data: profile, error: getError } = await supabaseAdmin
                .from('users')
                .select('id, username')
                .eq('id', userId)
                .single();

            if (getError || !profile) {
                throw getError || new Error('User profile not found');
            }

            const defaultAvatar = this.buildInitialAvatar(profile.username);

            const { data, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ avatar: defaultAvatar, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select('id, username, email, avatar')
                .single();

            if (updateError) {
                throw updateError;
            }

            return {
                success: true,
                message: 'Avatar cleared and reset to default icon',
                avatar: data.avatar
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to clear avatar',
                error
            };
        }
    }
}

const authService = new AuthService();
export default authService;
