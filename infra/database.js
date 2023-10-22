import { Client } from 'pg'

async function query(queryObject) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
  })
  await client.connect()
  const result = await client.query(queryObject)
  await client.end()
  return result
}


export default {
  query: query,
}