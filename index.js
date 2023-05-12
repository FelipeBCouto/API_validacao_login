const express = require("express");
const { pool } = require("./data/data");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('.')
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const client = await pool.connect();
    // Verificar se esse email existe
    const findUser = await client.query(`SELECT * FROM Users where email='${email}'`);
    if (!findUser) {
        return res.status(401).json({ error: 'Usuario não existe' });
    }

    
    // Verificar se a senha esta correta.
    if (parseInt(findUser.rows[0].password) !== password) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, nome } = findUser.rows[0]
    return res.status(200).json({
        user: {
            id,
            nome,
            email,
        },
        token: jwt.sign({ id }, process.env.SECRET_JWT, {
            expiresIn: process.env.EXPIRESIN_JWT,
        }),
    });
})

app.get("/users", async (req, res) => {
    try {
        const client = await pool.connect();
        const { rows } = await client.query("SELECT * FROM Users");
        console.table(rows);
        res.status(200).send(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})


app.post("/users", async (req, res) => {
    try {
        const { id, nome, email, password } = req.body;
        const client = await pool.connect();
        await client.query(`INSERT into Users values (${id}, '${email}', '${password}', '${nome}')`);
        res.status(200).send(`O usuário "${nome}" foi cadastrado com a id "${id}"!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})


app.put("/users/:id", async (req, res) => {

    try {
        const {id, nome, email, password } = req.body;

        const client = await pool.connect();
        await client.query(`UPDATE Users SET nome = '${nome}',email ='${email}',password ='${password}' WHERE id=${id}`);
        res.status(200).send(`O usuário "${nome}" foi alterado!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})


app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.body;
        const client = await pool.connect();
        const del = await client.query(`DELETE FROM Users where id=${id}`);
        res.status(200).send(`A ocorrência referente a id "${id}" foi excluída!`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro de conexão com o servidor");
    }
})

app.listen(8080, () => console.log("O servidor está ativo na porta 8080"));
