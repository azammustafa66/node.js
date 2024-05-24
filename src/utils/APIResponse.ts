class APIResponse {
  statusCode: number
  data: any
  message: string
  success: boolean
  errors: any[]

  constructor(statusCode = 200, data: any = null, message = 'Success', errors: any[] = []) {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = this.statusCode < 400
    this.errors = errors
  }
}

export default APIResponse
