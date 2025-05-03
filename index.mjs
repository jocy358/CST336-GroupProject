import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

app.set('trust proxy', 1) 
app.use(session({
  secret: 'cst336 csumb',
  resave: false,
  saveUninitialized: true
}))

const pool = mysql.createPool({
    host: "ant-constante.online",
    user: "antcons1_finaluser",
    password: "finaluser",
    database: "antcons1_final-project",
    connectionLimit: 10,
    waitForConnections: true
});

const conn = await pool.getConnection();

app.get('/', (req, res) => {
   res.render('home.ejs')
});

app.post('/login', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashPassword;
    let sql = "SELECT * FROM users WHERE username = ?";
    const [rows] = await conn.query(sql, [username]);
    if(rows.length > 0) {
        hashPassword = rows[0].password;
    }
    const match = await bcrypt.compare(password, hashPassword);
    if(match) {
        req.session.userAuthenticated = true;
        req.session.fullName = rows[0].firstName + ' ' + rows[0].lastName;
        res.render('home.ejs')
    } else {
        res.render('login.ejs', {"error":"Wrong credentials!"})
    }
})

app.get('/signup', async(req, res) => {
    res.render('signup.ejs')
    
});
app.get('/overview', async(req, res) => {
    res.render('overview.ejs')
});


app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});

app.listen(3000, ()=>{
    console.log("Express server running")
})

