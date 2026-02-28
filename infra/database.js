// import { Client } from 'pg'

// async function query(queryObject) {
//   const client = new Client({
//     host: process.env.POSTGRES_HOST,
//     port: process.env.POSTGRES_PORT,
//     user: process.env.POSTGRES_USER,
//     database: process.env.POSTGRES_DB,
//     password: process.env.POSTGRES_PASSWORD,
//   })
//   await client.connect()
//   const result = await client.query(queryObject)
//   await client.end()
//   return result
// }

// export default {
//   query: query,
// }

import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
});

async function query(queryObject) {
  return await pool.query(queryObject);
}

export default {
  query: query,
};
