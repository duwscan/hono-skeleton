import { drizzle } from "drizzle-orm/mysql2";

import mysql from "mysql2/promise";
import { databaseConfig } from '../config/database.js';

const dbCredentials = {
  host: databaseConfig.host,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.database,
  port: databaseConfig.port,
}
  
const poolConnection = mysql.createPool(dbCredentials);
const db = drizzle({ client: poolConnection });
// or if you need client connection
async function main() {
  const connection = await mysql.createConnection(dbCredentials);
  const db = drizzle({ client: connection });
}
main();


export default db;

