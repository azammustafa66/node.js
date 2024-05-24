import { Request, Response, NextFunction } from 'express'

// This is an arrow function that takes a function as an argument and returns an async function
const asyncHandlerArrow =
  (requestHandler: Function) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next)
    } catch (error: any) {
      res.status(error.code || 500).json({ message: error.message, success: false })
    }
  }

// This is the same as the previous function, but written as a function declaration
function asyncHandlerNormal(requestHandler: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next)
    } catch (error: any) {
      res.status(error.code || 500).json({ message: error.message, success: false })
    }
  }
}

// This is the same as the previous function but in the form of Promises
const asyncHandlerPromise = (requestHandler: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(requestHandler(req, res, next)).catch((error) => {
    res.status(error.code || 500).json({ message: error.message, success: false })
  })
}
