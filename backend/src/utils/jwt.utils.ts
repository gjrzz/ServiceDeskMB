import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  perfil: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as string,
  } as SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as string,
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};
