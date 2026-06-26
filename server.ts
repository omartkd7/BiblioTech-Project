import "dotenv/config";
import express from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
});

const main = async () => {
    try {
        const db = await pool.connect();
        console.log("db is Connected");

        const createTableBooks = `
            CREATE TABLE IF NOT EXISTS livres (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                author_name VARCHAR(100),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await db.query(createTableBooks);

        app.post("/livres", async (req, res) => {
            try {
                const { name, isAvailable, authorName } = req.body;
                const insertQuery = `
                    INSERT INTO livres (name, author_name, is_available)
                    VALUES ($1, $2, $3)
                `;
                await db.query(insertQuery, [name, authorName, isAvailable]);
                res.status(201).json({ message: "The Book has been created" });
            } catch (_err) {
                console.log(_err);
                res.status(403).json({ error: "Error occurred, please provide all information needed" });
            }
        });

        app.listen(5020, () => console.log("This app is listening on port 5020"));
    } catch (error) {
        console.log("Oops something went wrong!", error);
    }
};

main();
