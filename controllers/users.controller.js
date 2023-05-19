import { db } from "../database/database.connection.js";

export async function signUp(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    try {
        const emailExist = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        if (emailExist.rowCount > 0) return res.sendStatus(409);

        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`, [name, email, password]);
        res.sendStatus(201);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}