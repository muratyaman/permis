import { Request, Response } from 'express';
import { PermisError } from './permis';


export function sendError(req: Request, res: Response, err: any | Error | PermisError) {
  const status = err instanceof PermisError ? err.status : 500;
  const msg = err instanceof Error ? err.message : 'Unexpected error';
  res.status(status).json({ error: msg });
}
