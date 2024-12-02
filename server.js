import express from "express"
import bodyParser from "body-parser"
import pg from "pg"

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

//User Database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "Hans1997",
    port: 5432
})

db.connect();

let loginStatus = false;
let currentUserId;
let name = "";

app.get("/", async (req, res) => {
    try {
    if (loginStatus) {
    }
    res.render("index.ejs", {userId: currentUserId, name: name})
    } catch (err) {
        console.log("Error fetching data user :", err.message)
        res.render("index.ejs", {userId: currentUserId, name: name})
    }
    }
)

app.get("/register", (req, res) => {
    res.render("register.ejs")
})

app.post("/register", async (req, res) => {
    const username = req.body.inputUsername
    const name = req.body.inputName
    const password = req.body.inputPassword

    try {
    await db.query(
        "INSERT INTO users (username, name, password) VALUES ($1, $2, $3)",
        [username, name, password])
    res.redirect("/")
    } catch (err) {
        console.log('Cannot register new account', err.message)
        res.redirect("/")
    }
})

app.get("/login", async (req, res) => {
    if (loginStatus) {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [currentUserId]);
        const user = result.rows[0]
        name = user.name
        res.render("login.ejs", {name: name})
    } else {
        let name = "";
        res.render("login.ejs", {name: name})
    }
})

app.post("/login", async (req, res) => {
        const username = req.body.inputUsername
        const password = req.body.inputPassword
    
    try {
        const result = await db.query("SELECT * FROM users WHERE username = ($1) AND password = ($2) LIMIT 1", [username, password])
        const user = result.rows[0]         //
        if (!user) {
            return res.render("login.ejs", {error: 'Incorrect username, please try again'})
        } if (!user || user.password !== password) {
            return res.render("login.ejs", {error: 'Inccorect password, please try again'})
        } else {
            currentUserId = user.id
            name = user.name
            loginStatus = true
            res.redirect("/")
        }  
    } catch (err) {
        console.error("Login error :", err.message)
        res.redirect("/login")
    }
})

app.get('/:id', async (req, res) => {
    try {
    const id = parseInt(req.params.id)
    res.render("index.ejs", {id: id})
    if (loginStatus) {
        const now = new Date()
        const day = now.getDate();
        const month = now.getMonth();
        const year = now.getYear();
        const time = day + '/' + month + '/' + year
        await db.query("INSERT INTO access_books (title, user_id, access_date) VALUES ($1, $2, $3)", 
            [id, currentUserId, time]
        )
    }
    } catch (err) {
        console.log('Error :', err.message)
        res.status(500).send('Server Error');
    }
})

app.get("/mybooks", async (req, res) => {
    try {
        if(!loginStatus){
            res.redirect("/")
        } else {
            const request = await db.query("SELECT title FROM access_books WHERE user_id = ($1)",
                [currentUserId]
            )
            
            const books =  request.rows
            console.log("Books data:", books);
            res.render("mybooks.ejs", {books: books, name: name})
        }
    } catch (err) {
        console.log(`Error :` , err.message)
        res.redirect("/")
    }
})

app.get("/logout", (req, res) => {
    loginStatus = false;
    currentUserId = null; // Reset user ID on logout
    name = null;
    console.log(name)
    res.redirect("/"); // Redirect to the homepage
});

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})

