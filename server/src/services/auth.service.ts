import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateVerificationCode, generateExpiryDate } from '../utils/generateCode';

const prisma = new PrismaClient();

export class AuthService {
  
  async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      if (existingUser.status === 'ACTIVE') {
        throw new Error('An account with this email already exists.');
      }
      
      if (existingUser.status === 'PENDING') {
        const verificationCode = generateVerificationCode();
        const verificationExpires = generateExpiryDate(15);
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { verificationCode, verificationExpires }
        });
        
        console.log(`\n📧 CODE VERIFICATION: ${verificationCode} (pour ${email})\n`);
        
        return {
          message: 'Verification code resent.',
          userId: existingUser.id,
          code: verificationCode
        };
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationExpires = generateExpiryDate(15);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'PENDING',
        verificationCode,
        verificationExpires
      }
    });
    
    console.log(`\n📧 CODE VERIFICATION: ${verificationCode} (pour ${email})\n`);
    
    return {
      message: 'Account created.',
      userId: user.id,
      code: verificationCode
    };
  }
  
  async verifyEmail(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found.');
    }
    
    if (user.status === 'ACTIVE') {
      throw new Error('Account is already verified.');
    }
    
    if (!user.verificationCode || !user.verificationExpires) {
      throw new Error('No verification code found. Please request a new one.');
    }
    
    if (new Date() > user.verificationExpires) {
      throw new Error('Verification code has expired. Please request a new one.');
    }
    
    if (user.verificationCode !== code) {
      throw new Error('Invalid verification code. Please try again.');
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        verificationCode: null,
        verificationExpires: null
      }
    });
    
    return {
      message: 'Account verified successfully. You can now log in.'
    };
  }
  
  async resendCode(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found.');
    }
    
    if (user.status === 'ACTIVE') {
      throw new Error('Account is already verified.');
    }
    
    const verificationCode = generateVerificationCode();
    const verificationExpires = generateExpiryDate(15);
    
    await prisma.user.update({
      where: { id: userId },
      data: { verificationCode, verificationExpires }
    });
    
    console.log(`\n📧 NOUVEAU CODE: ${verificationCode} (pour ${user.email})\n`);
    
    return {
      message: 'New verification code generated.',
      userId: user.id,
      code: verificationCode
    };
  }
  
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new Error('Please verify your email before logging in. Check your inbox.');
    }
    
    if (!user.password) {
      throw new Error('This account uses Google authentication. Please sign in with Google.');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password.');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    };
  }
  // Forgot Password - Envoyer le code
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe
      throw new Error('If this email is registered, a reset code has been sent.');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not verified. Please verify your account first.');
    }
    
    const resetCode = generateVerificationCode();
    const resetExpires = generateExpiryDate(10); // 10 minutes
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: resetCode,
        verificationExpires: resetExpires
      }
    });
    
    console.log(`\n🔑 RESET CODE: ${resetCode} (pour ${email})\n`);
    
    return {
      message: 'If this email is registered, a reset code has been sent.',
      userId: user.id,
      code: resetCode
    };
  }

  // Vérifier le code de reset
  async verifyResetCode(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found.');
    }
    
    if (!user.verificationCode || !user.verificationExpires) {
      throw new Error('No reset code found. Please request a new one.');
    }
    
    if (new Date() > user.verificationExpires) {
      throw new Error('Reset code has expired. Please request a new one.');
    }
    
    if (user.verificationCode !== code) {
      throw new Error('Invalid reset code. Please try again.');
    }
    
    return {
      message: 'Code verified. You can now reset your password.',
      userId: user.id
    };
  }

  // Réinitialiser le mot de passe
  async resetPassword(userId: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found.');
    }
    
    if (!user.verificationCode || !user.verificationExpires) {
      throw new Error('No reset code found. Please request a new one.');
    }
    
    if (new Date() > user.verificationExpires) {
      throw new Error('Reset code has expired. Please request a new one.');
    }
    
    if (user.verificationCode !== code) {
      throw new Error('Invalid reset code.');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationExpires: null
      }
    });
    
    return {
      message: 'Password reset successfully. You can now log in.'
    };
  }
}
