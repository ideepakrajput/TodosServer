const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const url = require("url");
const sqlite = require("sqlite3").verbose();
require('dotenv').config()

const PORT = 8000 || process.env.PORT;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

const db = new sqlite.Database("./todo.db", sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err);
    }
    console.log("Connected to todo database.");
});

const sql = `
    CREATE TABLE todos (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        task,
        isComplete BOOLEAN DEFAULT false
    )
`;
// db.run(sql)

const addIsCompleteColumnQuery = `
    ALTER TABLE todos
    ADD COLUMN isComplete BOOLEAN DEFAULT false;
`;

// Add
app.post("/todo", (req, res) => {
    const { task } = req.body;
    let sql = `INSERT INTO todos(task) VALUES(?)`;
    try {
        db.run(sql, [task], async (err) => {
            if (err) return res.json({ status: 401, success: false, error: err })
        })
        return res.json({
            status: 200,
            success: true,
        })
    } catch (error) {
        return res.json({
            status: 400,
            success: false,
        })
    }
})

// Get
app.get("/", (req, res) => {
    let sql = "SELECT * FROM todos";
    try {
        const queryObject = url.parse(req.url, true).query;
        if (queryObject.field && queryObject.type) {
            sql += ` WHERE ${queryObject.field} LIKE "%${queryObject.type}%"`;
        }
        db.all(sql, [], (err, rows) => {
            if (err) return res.json({ status: 401, success: false, error: err })
            if (rows.length < 1) {
                return res.json({ status: 402, success: false, error: "No Match Found !" })
            }
            return res.json({ status: 200, data: rows, success: true })
        })
    } catch (error) {
        return res.json({
            status: 400,
            success: false,
        })
    }
})

//Update
app.put("/todo", (req, res) => {
    const { ID, task } = req.body;
    try {
        let sql = "UPDATE todos SET task = ? WHERE ID = ?";
        db.run(sql, [task, ID], (err) => {
            if (err) return res.json({ status: 401, success: false, error: err })
        })
        return res.json({
            status: 200,
            success: true,
        })
    } catch (error) {
        return res.json({
            status: 400,
            success: false,
        })
    }
})

// Delete
app.delete("/todo", (req, res) => {
    const { ID } = req.body;
    try {
        let sql = "DELETE FROM todos WHERE ID = ?";
        db.run(sql, [ID], (err) => {
            if (err) return res.json({ status: 401, success: false, error: err })
        })
        return res.json({
            status: 200,
            success: true,
        })
    } catch (error) {
        return res.json({
            status: 400,
            success: false,
        })
    }
})


app.listen(PORT, () => {
    console.log(`server is running on ${PORT}...`);
});
