import type { loginDto, signupDto } from "./auth.dto.js";
import {
  ConflictException,
  notfoundexception as NotFoundException,
  badrequestexception as BadRequestException,
} from "../common/exceptions/domain.exceptions.js";

import UserRepo from "../DB/Repo/user.repo.js";
import { hashOperation, compareOperation } from "../common/security/hash.js";
import { encryptValue } from "../common/security/encrypt.js";
import TokenService from "../common/security/token.service.js";
import MailService from "../common/mail.service.js";
import RedisService from "../common/redis.service.js";
import { User } from "../DB/models/user.modle.js";
import { RoleEnum } from "../common/enums/user.enums.js";

class AuthService {
  private _userRepo = new UserRepo();
  private _tokenService = TokenService;
  constructor() {}

  public async signUp(body: signupDto): Promise<any> {
    const { email, password, phoneNumber } = body;

    const isEmail = await this._userRepo.findOne({
      filter: { email },
    });

    if (isEmail) {
      throw new ConflictException("email already exists");
    }

    const hashedPassword = await hashOperation({
      PlainText: password,
    });

    const encryptedPhone = phoneNumber
      ? encryptValue({ value: phoneNumber })
      : undefined;

    const [user] = await this._userRepo.create({
      data: [
        {
          ...body,
          password: hashedPassword,
          phoneNumber: encryptedPhone,
          provider: "local",
          confirmEmail: false,
          role: RoleEnum.USER,
        },
      ],
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    try {
      const { accessSignature } = this._tokenService.getSignature(user.role as RoleEnum);
      const token = this._tokenService.generateToken({
        payload: {},
        signature: accessSignature,
        options: { subject: user._id.toString(), expiresIn: 60 * 60 },
      });

      const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
      const confirmLink = `${appUrl}/auth/confirm?token=${token}`;

      await MailService.sendMail({
        to: user.email,
        subject: 'Confirm your email',
        html: `Click <a href="${confirmLink}">here</a> to confirm your email`,
      });
    } catch (err) {}

    return user;
  }

  public async confirmEmail(token: string) {
    try {
      const decoded: any = this._tokenService.decodeToken({ token });
      if (!decoded || !decoded.sub) throw new BadRequestException('Invalid token');
      const userId = decoded.sub;
      const user = await this._userRepo.findOne({ filter: { _id: userId } });
      if (!user) throw new NotFoundException('User not found');
      if (user.confirmEmail) return user;
      await User.findByIdAndUpdate(userId, { confirmEmail: true });
      return await this._userRepo.findOne({ filter: { _id: userId } });
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  public async resendConfirmation(email: string) {
    const user = await this._userRepo.findOne({ filter: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.confirmEmail) throw new BadRequestException('Email already confirmed');
    const { accessSignature } = this._tokenService.getSignature(user.role as RoleEnum);
    const token = this._tokenService.generateToken({
      payload: {},
      signature: accessSignature,
      options: { subject: user._id.toString(), expiresIn: 60 * 60 },
    });
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const confirmLink = `${appUrl}/auth/confirm?token=${token}`;
    await MailService.sendMail({ to: user.email, subject: 'Resend confirmation', html: `Click <a href="${confirmLink}">here</a> to confirm your email` });
    return true;
  }

  public async login(body: loginDto): Promise<any> {
    const { email, password } = body;

    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundException("invalid credentials");
    }

    if (!user.confirmEmail) {
      throw new BadRequestException("You need to confirm your email first");
    }

    const isPasswordValid = await compareOperation({
      PlainText: password,
      hashedValue: user.password,
    });

    if (!isPasswordValid) {
      throw new NotFoundException("invalid credentials");
    }

    const tokens = this._tokenService.generateAccessAndRefreshTokens(user as any);

    return {
      user,
      ...tokens,
    };
  }

  public async forgotPassword(email: string) {
    const user = await this._userRepo.findOne({ filter: { email } });
    if (!user) throw new NotFoundException('User not found');
    const { accessSignature } = this._tokenService.getSignature(user.role as RoleEnum);
    const token = this._tokenService.generateToken({ payload: {}, signature: accessSignature, options: { subject: user._id.toString(), expiresIn: 60 * 30 } });
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;
    await MailService.sendMail({ to: user.email, subject: 'Reset your password', html: `Click <a href="${resetLink}">here</a> to reset your password` });
    return true;
  }

  public async resetPassword(token: string, newPassword: string) {
    try {
      const decoded: any = this._tokenService.decodeToken({ token });
      if (!decoded || !decoded.sub) throw new BadRequestException('Invalid token');
      const userId = decoded.sub;
      const hashedPassword = await hashOperation({ PlainText: newPassword });
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
      return true;
    } catch (err) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  public async logout(refreshToken: string) {
    try {
      const decoded: any = this._tokenService.decodeToken({ token: refreshToken });
      const jti = decoded && (decoded.jti || decoded.jwtid);
      const exp = decoded && decoded.exp;
      if (jti && exp) {
        const ttl = Math.max(1, exp - Math.floor(Date.now() / 1000));
        await RedisService.set(`bl_${jti}`, '1', ttl);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  public async socialLogin(profile: { email: string; username?: string; provider: string; picture?: string }) {
    const { email, username, provider, picture } = profile;
    let user = await this._userRepo.findOne({ filter: { email } });
    if (!user) {
      const [created] = await this._userRepo.create({ data: [{ email, username: username || email.split('@')[0], provider, confirmEmail: true, password: Math.random().toString(36), role: RoleEnum.USER, profilePicture: picture }] });
    if (!created) throw new Error('Failed to create social user');
    user = created;
  }
  const tokens = this._tokenService.generateAccessAndRefreshTokens(user as any);
  return { user, ...tokens };
  }
}

export default new AuthService();