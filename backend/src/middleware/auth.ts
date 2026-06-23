//这是一个用于验证 JWT 的中间件，确保用户在访问受保护的路由时已经登录，并且可以根据用户角色进行权限控制。

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../api/tokenBlacklist.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

/** JWT 解码后的用户信息 */
export interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

// 扩展 Express Request 类型，添加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 验证 JWT 的中间件
 * 在需要登录才能访问的路由上使用
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未登录，请先登录',
    });
  }

  const token = authHeader.split(' ')[1];

  // 检查 token 是否已被注销
  if (isBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: '登录已失效，请重新登录',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '登录已过期，请重新登录',
    });
  }
}

/**
 * 验证管理员角色的中间件
 * 需要在 authMiddleware 之后使用
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无权限，仅管理员可执行此操作',
    });
  }
  next();
}