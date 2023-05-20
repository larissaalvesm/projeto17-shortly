import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function shortenUrl(req, res) {

    const { url } = req.body;

    try {
        const session = res.locals.session;
        const shortenedUrl = nanoid(8);
        const userId = session.rows[0].userId;

        await db.query(`INSERT INTO urls ("userId", "shortUrl", "url") VALUES ($1, $2, $3);`, [userId, shortenedUrl, url]);

        const urlInfos = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1`, [shortenedUrl]);

        const body = {
            "id": urlInfos.rows[0].id,
            "shortUrl": urlInfos.rows[0].shortUrl
        }
        res.send(body);

    }
    catch (err) {
        res.status(500).send(err.message);
    }
}