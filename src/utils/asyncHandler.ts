import { Request, Response, NextFunction } from 'express'

// An utilty function that takes a function as an argument and returns an async function
// can also be written using async/await, normal function syntax or a promise
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => next(error))
  }

export default asyncHandler
