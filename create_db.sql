CREATE DATABASE IF NOT EXISTS myBookshop;
USE myBookshop;
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,name VARCHAR(50),price DECIMAL(5, 2) unsigned,PRIMARY KEY(id));
INSERT INTO books (name, price)VALUES('database book', 40.25),('Node.js book', 25.00), ('Express book', 31.99);
CREATE TABLE IF NOT EXISTS userDetails (username varchar(50), first VARCHAR(50), last varchar(50), email varchar(50), hashedPassword varchar(64), PRIMARY KEY(username));
-- INSERT INTO userDetails (username, first, last, email, hashedPassword)VALUES('mkhan024', 'Mahdi', 'Khan', 'mkhan024@gold.ac.uk', 'qwiruq0e9jcq9q0343qci90fjf');
-- drop user 'appuser'@'localhost';
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'appuser'@'localhost';