import express from "express";
import axios from "axios";
import cors from "cors"


const port = 4000;
const app = express();

const baseURL = "https://covers.openlibrary.org/b/ISBN/";

app.use(express.static("public"))
app.use(cors({
    origin: 'http://localhost:3000' // This allows requests from frontend on port 3000
}));

app.get("/",(req, res) => {
    res.render("index.ejs", {covers: []}) //Pass empty covers for now
})

app.get("/api/covers", async (req, res) =>{
    try {
        const identifier = ['9780385472579', '9780140449136', '9780140449136', '9780140449136'];

        const covers = identifier.map(id => ({id, url: baseURL + `${id}-M.jpg`}))
        res.json(covers)
    } catch (err) {
        console.log(`Error fetching covers:`, err)
        res.status(500).send(`Error fetching covers`)
    }
})



app.listen(port, ()=> {
    console.log(`API is running on port ${port}`)
})