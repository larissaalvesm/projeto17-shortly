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

export async function getUrlsByUser(req, res) {
    try {
        const session = res.locals.session;
        const userId = session.rows[0].userId;

        const data = await db.query(`
        SELECT users.id as "userId", users.name, urls.id as "urlId", urls."shortUrl", urls.url, urls."visitCount"
        FROM users
        JOIN urls ON users.id = urls."userId"
        WHERE users.id=$1
        `, [userId]);

        const id = data.rows[0].userId;
        const name = data.rows[0].name;
        let totalVisitCount = 0;
        const shortenedUrls = [];

        data.rows.map(row => totalVisitCount = totalVisitCount + row.visitCount);

        data.rows.map(row => {
            const obj = {
                "id": row.urlId,
                "shortUrl": row.shortUrl,
                "url": row.url,
                "visitCount": row.visitCount
            };
            shortenedUrls.push(obj);
        });

        const obj = {
            "id": id,
            "name": name,
            "visitCount": totalVisitCount,
            "shortenedUrls": shortenedUrls
        }

        res.status(200).send(obj);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

export async function ranking(req, res) {
    try {

        const data = await db.query(`
        SELECT users.id, users.name, COUNT(urls.id) as "linksCount", SUM(urls."visitCount") as "visitCount"
        FROM users
        JOIN urls ON users.id = urls."userId"
        GROUP BY users.id
        ORDER BY "visitCount" DESC
        LIMIT 10;
        `)

        const body = data.rows;

        res.status(200).send(body);

    }
    catch (err) {
        res.status(500).send(err.message);
    }
}
