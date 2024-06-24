const sql = require('mssql');
const pool = require('../configuration/db');
const bcrypt = require('bcrypt');

async function findUserByEmail(email){
    try{
        await pool.connect();
        const query = `
        SELECT * FROM users WHERE email = @email
        `;
        const result = await pool.request()
        .input('email',sql.VarChar,email)
        .query(query);

        if(result.recordset.length > 0){
            return {success:true, user: result.recordset[0]};
        }else{
            return {success:false, message: 'User not found'};
        }
    }catch(error){
        console.error('Error fetching user by email:', error.message);
        return { success: false, message: 'Internal Server Error' };
    } finally {
        pool.close();
    }
}

async function validatePassword(inputPassword, storedPassword){
    return bcrypt.compare(inputPassword, storedPassword);
}

module.exports = {
    findUserByEmail,
    validatePassword
}