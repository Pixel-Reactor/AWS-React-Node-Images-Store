// Archivo que crea la conexión con la base de datos

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const { DB_HOST, DB_USER, DB_PWD, DB_DB } = process.env;

let pool;


export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 10,
      host: DB_HOST,
      user: DB_USER,
      password:DB_PWD,
      database:DB_DB,
   
    });
  }

  return await pool.getConnection();
};
