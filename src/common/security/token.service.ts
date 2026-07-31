import {
    TOKEN_SIGNATURE_User_ACCESS,
    TOKEN_SIGNATURE_Admin_ACCESS,
    TOKEN_SIGNATURE_User_REFRESH,
    TOKEN_SIGNATURE_Admin_REFRESH
} from "../../config/config.service.js";

import { TokenTypeEnum } from "../enums/token.enum.js";
import { RoleEnum } from "../enums/user.enums.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { IHUser } from "../../DB/models/user.modle.js";
import RedisService from "../redis.service.js";

class TokenService {

    getSignature(role: RoleEnum) {
        let accessSignature = "";
        let refreshSignature = "";

        if (role === RoleEnum.USER) {
            accessSignature = TOKEN_SIGNATURE_User_ACCESS;
            refreshSignature = TOKEN_SIGNATURE_User_REFRESH;
        } else if (role === RoleEnum.ADMIN) {
            accessSignature = TOKEN_SIGNATURE_Admin_ACCESS;
            refreshSignature = TOKEN_SIGNATURE_Admin_REFRESH;
        }

        return { accessSignature, refreshSignature };
    }

    generateToken({
        payload = {},
        signature,
        options = {}
    }: {
        payload?: object | string;
        signature: string;
        options?: SignOptions;
    }) {
        return jwt.sign(payload, signature, options);
    }

    verifyToken({
        token,
        signature
    }: {
        token: string;
        signature: string;
    }) {
        return jwt.verify(token, signature);
    }

    decodeToken({ token }: { token: string }) {
        return jwt.decode(token);
    }

    normalizeToken(header?: string) {
        if (!header) return undefined;
        return header.startsWith("Bearer ") ? header.slice(7) : header;
    }

    async authenticateAccessToken(header?: string) {
        const token = this.normalizeToken(header);
        if (!token) throw new Error("No token provided");
        const decoded = this.decodeToken({ token }) as jwt.JwtPayload | null;
        if (!decoded?.sub) throw new Error("Invalid token payload");
        const role = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
        const normalizedRole = role === RoleEnum.ADMIN ? RoleEnum.ADMIN : RoleEnum.USER;
        const { accessSignature } = this.getSignature(normalizedRole);
        const verified = this.verifyToken({ token, signature: accessSignature }) as jwt.JwtPayload;
        if (!verified.sub) throw new Error("Invalid token payload");
        const tokenType = Array.isArray(verified.aud) ? verified.aud[1] : undefined;
        if (tokenType !== TokenTypeEnum.ACCESS) throw new Error("Access token required");
        const jti = verified.jti || verified.jwtid;
        if (jti && await RedisService.get(`bl_${jti}`)) throw new Error("Token revoked");
        return { token, userId: verified.sub, role: normalizedRole, payload: verified };
    }

    generateAccessAndRefreshTokens(user: IHUser) {
        const { accessSignature, refreshSignature } = this.getSignature(user.role);

        const tokenId = randomUUID();

        const access_token = this.generateToken({
            signature: accessSignature,
            options: {
                audience: [String(user.role), TokenTypeEnum.ACCESS],
                expiresIn: 60 * 15,
                subject: user._id.toString(),
                jwtid: tokenId,
            },
        });

        const refresh_token = this.generateToken({
            signature: refreshSignature,
            options: {
                audience: [String(user.role), TokenTypeEnum.REFRESH],
                expiresIn: "1y",
                subject: user._id.toString(),
                jwtid: tokenId,
            },
        });

        return { access_token, refresh_token };
    }
}

export default new TokenService();