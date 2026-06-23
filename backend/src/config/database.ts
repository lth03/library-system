import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', //这个参数设置为'localhost'表示连接数据库时使用的主机名，如果数据库设置了其他主机名，则需要在这里填写正确的主机名
  port: Number(process.env.DB_PORT) || 3306, //这个参数设置为3306表示连接数据库时使用的端口号，如果数据库设置了其他端口号，则需要在这里填写正确的端口号
  user: process.env.DB_USER || 'root', //这个参数设置为'root'表示连接数据库时使用的用户名，如果数据库设置了其他用户名，则需要在这里填写正确的用户名
  password: process.env.DB_PASSWORD || '', //这个参数设置为''表示连接数据库时不需要密码，如果数据库设置了密码，则需要在这里填写正确的密码
  database: process.env.DB_NAME || 'library', //这个参数设置为'database'表示连接到名为'database'的数据库，如果该数据库不存在，则会抛出错误
  charset: 'utf8mb4', //设置字符集为utf8mb4，支持存储emoji表情和多语言字符
  waitForConnections: true, //这个参数设置为true表示当连接池中没有可用连接时，新的连接请求将会被排队等待，直到有可用连接为止
  connectionLimit: 10, //这个参数设置为10表示最多允许10个连接同时存在，超过这个数量的连接请求将会被排队等待
  queueLimit: 0, //这个参数设置为0表示没有限制，允许无限制的排队连接请求
});

export default pool;
