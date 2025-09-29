import { drizzle } from 'drizzle-orm/mysql2'

import mysql from "mysql2/promise";
import { databaseConfig } from '../config/database.js';
import * as schema from './schema.js';

const dbCredentials = {
  host: databaseConfig.host,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  port: databaseConfig.port,
}
  
const poolConnection = mysql.createPool(dbCredentials);
const db = drizzle(poolConnection, { schema, mode: "default" })
async function main() {
  const connection = await mysql.createConnection(dbCredentials);
  const db = drizzle(connection, { schema, mode: "default" });
}
main();


export default db;

