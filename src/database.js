const mysql = require('mysql');
const { promisify } = require('util');


const { database } = require('./keys');

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
    if(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('La conexion a la base de datos fue cerrada');
        }
        if (err.code === 'ER_CON_COUNT_ERROR'){
            console.error('la cantidad de conexiones efectuadas supera el limite');
        }
        if (err.code === 'ECONNREFUSED'){
            console.error('conexion a la base de datos rechazada')
        }
    }

    if(connection) connection.release();
    console.log('conexion a la base de datos establecida');
    return;
});

pool.query = promisify(pool.query);

module.exports = pool;