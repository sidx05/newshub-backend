import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../utils/validation';
import { logger } from '../utils/logger';

export class AuthService {
  async register(input: RegisterInput) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        email: input.email,
        passwordHash: input.password, // Will be hashed by pre-save hook
        role: input.role,
      });

      await user.save();

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).passwordHash;

      return { user: userResponse, token };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(input: LoginInput) {
    try {
      // Find user by email
      const user = await User.findOne({ email: input.email }).select('+passwordHash');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(input.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = generateToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).passwordHash;

      return { user: userResponse, token };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await User.findById(userId).populate('savedArticles readingHistory');
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async saveArticle(userId: string, articleId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add to saved articles if not already saved
      if (!user.savedArticles.includes(articleId as any)) {
        user.savedArticles.push(articleId as any);
        await user.save();
      }

      return user;
    } catch (error) {
      logger.error('Save article error:', error);
      throw error;
    }
  }

  async addToHistory(userId: string, articleId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove from history if already exists (to avoid duplicates)
      user.readingHistory = user.readingHistory.filter(
        (id) => id.toString() !== articleId
      );

      // Add to beginning of history
      user.readingHistory.unshift(articleId as any);

      // Keep only last 50 articles in history
      if (user.readingHistory.length > 50) {
        user.readingHistory = user.readingHistory.slice(0, 50);
      }

      await user.save();
      return user;
    } catch (error) {
      logger.error('Add to history error:', error);
      throw error;
    }
  }
}