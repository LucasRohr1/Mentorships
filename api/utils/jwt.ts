import {SignJWT, jwtVerify} from 'jose'
import {createSecretKey} from 'crypto'
import {env} from '../src/env.js'

export interface JWTPayload {
    id: string
    email: string
    name: string
    lastName: string
}

export const generateJWT = async (payload: JWTPayload) => {
    const secret = env.JWT_SECRET
    const secretKey = createSecretKey(secret, 'utf-8')

    const token = await new SignJWT({payload})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRES_IN)
        .sign(secretKey)

    return token
}

export const verifyToken = async (token: string): Promise<JWTPayload> => {
    const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8')
    const {payload} = await jwtVerify(token, secretKey)

    return payload as unknown as JWTPayload
}