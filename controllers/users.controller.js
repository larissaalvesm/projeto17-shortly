import { db } from "../database/database.connection.js";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function signUp(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    try {
        const emailExist = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        if (emailExist.rowCount > 0) return res.sendStatus(409);

        const hash = bcrypt.hashSync(password, 10);

        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`, [name, email, hash]);
        res.sendStatus(201);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signIn(req, res) {
    const { email, password } = req.body;

    try {
        const userExist = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        if (userExist.rowCount === 0) return res.sendStatus(401);

        if (!bcrypt.compareSync(password, userExist.rows[0].password)) return res.sendStatus(401);

        const token = uuid();
        const userId = userExist.rows[0].id;

        await db.query(`INSERT INTO sessions ("userId", "userToken") VALUES ($1, $2);`, [userId, token]);
        res.send({ token: token });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

