import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function shortenUrl(req, res) {

    const { url } = req.body;

    try {
        const session = res.locals.session;
        const shortenedUrl = nanoid(8);
        const userId = session.rows[0].userId;

        await db.query(`INSERT INTO urls ("userId", "shortUrl", "url") VALUES ($1, $2, $3);`, [userId, shortenedUrl, url]);

        const urlInfos = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortenedUrl]);

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

export async function getUrlById(req, res) {

    const { id } = req.params;

    try {
        const urlExist = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if (urlExist.rowCount === 0) return res.sendStatus(404);

        const body = {
            "id": urlExist.rows[0].id,
            "shortUrl": urlExist.rows[0].shortUrl,
            "url": urlExist.rows[0].url
        }

        res.send(body);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

export async function openShortUrl(req, res) {
    const { shortUrl } = req.params;

    try {
        const shortUrlExist = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortUrl]);
        if (shortUrlExist.rowCount === 0) return res.sendStatus(404);

        const id = shortUrlExist.rows[0].id;
        const visitCount = shortUrlExist.rows[0].visitCount;
        const newVisitCount = visitCount + 1;
        const url = shortUrlExist.rows[0].url;

        await db.query(`UPDATE urls SET "visitCount"=$1 WHERE "id"=$2;`, [newVisitCount, id]);

        res.redirect(url);

    }
    catch (err) {
        res.status(500).send(err.message);
    }
}