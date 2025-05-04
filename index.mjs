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
   res.render('login.ejs')
});


app.post('/login', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashPassword;
    let sql = "SELECT * FROM users WHERE username = ?";
    let match;
    const [rows] = await conn.query(sql, [username]);
    if(rows.length > 0) {
        hashPassword = rows[0].password;
        match = await bcrypt.compare(password, hashPassword);
    } 
    if(match) {
        req.session.userAuthenticated = true;
        res.render('home.ejs')
    } else {
        res.render('login.ejs', {"error":"Wrong credentials!"})
    }
})

app.get('/signUp', async(req, res) => {
    res.render('signUp.ejs')
})

app.post('/signUp', async(req, res) => {
    let fn = req.body.firstname;
    let ln = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let confirmPassword = req.body.password_confirmation;
    let sql = "SELECT * FROM users WHERE username = ?";
    const [user] = await conn.query(sql, [username]);
    if(user.length > 0) {
        res.render('signUp.ejs', {"error":"Username already in use."})
    }
    else if(password != confirmPassword) {
        res.render('signUp.ejs', {"error":"Passwords do not match."})
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let sql = "INSERT INTO users (username, password, firstName, lastName) VALUES (?, ?, ?, ?)";
        let sqlParams = [username, hashedPassword, fn, ln];
        const [userInfo] = await conn.query(sql, sqlParams);
        res.render('login.ejs', {"error":"Successfully Signed Up"})
    }
})

app.get("/home",isAuthenticated, async(req, res) => {

    res.render('home.ejs');
});

app.get("/foodLogger", isAuthenticated, async(req, res) => {

    res.render('foodLogger.ejs');
});
app.get("/overview", isAuthenticated, async(req, res) => {

    res.render('overview.ejs');
});
app.get("/search", isAuthenticated, async(req, res) => {

    res.render('search.ejs');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('login.ejs')
}); 

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});

app.listen(3000, ()=>{
    console.log("Express server running")
})

function isAuthenticated(req, res, next) {
    if(req.session.userAuthenticated) {
        next();
    } else {
        res.redirect("/")
    }
}

