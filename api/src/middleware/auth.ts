import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JWTPayload } from '../../utils/jwt.js'

export interface authenticatedRequest extends Request {
    user?: JWTPayload
}

export const authenticateToken = async (
    req: authenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1] // Bearer <token> -> agarramos el token si existe
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }
        const payload = await verifyToken(token)
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Failed to authenticate token' })
    }
   
}