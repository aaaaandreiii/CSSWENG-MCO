import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '!1230#AzK', //change to your password
    database: 'mydb'//'dbdbdb'
});

db.connect(err =>{
    if(err) throw err;
    console.log("connected!");
});

export default db;