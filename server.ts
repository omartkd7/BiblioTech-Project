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
                titre VARCHAR(255) NOT NULL,
                auteur VARCHAR(255) NOT NULL,
                categorie VARCHAR(100),
                annee_publication INT,
                disponible BOOLEAN DEFAULT true
            )
        `;

        await db.query(createTableBooks);

        app.post("/livres", async (req, res) => {
            try {
                const { titre, auteur, categorie, annee_publication, disponible } = req.body;
                const insertQuery = `
                    INSERT INTO livres (titre, auteur, categorie, annee_publication, disponible)
                    VALUES ($1, $2, $3, $4, $5)
                `;
                await db.query(insertQuery, [titre, auteur, categorie, annee_publication, disponible]);
                res.status(201).json({ message: "Livre ajouté avec succès" });
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: "Erreur lors de l ajout du livre" });
            }
        });

        app.listen(5020, () => console.log("This app is listening on port 5020"));
    } catch (error) {
        console.log("Oops something went wrong!", error);
    }
};

main();
