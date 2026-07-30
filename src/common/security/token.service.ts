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