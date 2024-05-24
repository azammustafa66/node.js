import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/*.ts'],
  synchronize: true,
  logging: false
})

export default AppDataSource
