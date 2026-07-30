import { compare, hash } from 'bcrypt';
import { SALT_ROUND } from '../../config/config.service.js';

export async function hashOperation({ PlainText, rounds = SALT_ROUND, }: { PlainText: string; rounds?: number }) {

    return await hash(PlainText, rounds);

}

export async function compareOperation({ PlainText, hashedValue }: { PlainText: string; hashedValue: string }) {


    return await compare(PlainText, hashedValue);
}