import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import request from 'request';
import axios from 'axios';


const app = express();
let accessToken;

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

let clientID = '8d129b6dd98740a1b8999f06a91a356f'
let clientSecret = '3e9bfb8375144ffc9e6970f3090158fc'

var options = {
   method: 'POST',
   url: 'https://oauth.fatsecret.com/connect/token',
   method : 'POST',
   auth : {
      user : clientID,
      password : clientSecret
   },
   headers: { 'content-type': 'application/x-www-form-urlencoded'},
   form: {
      'grant_type': 'client_credentials',
      'scope' : 'basic'
   },
   json: true
};

request(options, function (error, response, body) {
   if (error) throw new Error(error);
   accessToken = body.access_token;
   console.log(body);
});

async function getFoodDetails(foodId) {
    const response = await axios.get('https://platform.fatsecret.com/rest/food/v4', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        food_id: foodId,
        format: 'json'
      }
    });
  
    return response.data;
  }

app.get('/', (req, res) => {
   res.render('login.ejs')
});

app.get('/food/:id', async (req, res) => {
    try {
      const foodId = req.params.id;
      const foodData = await getFoodDetails(foodId); // your API call
      console.log(foodData.food);
      res.render('food', { food: foodData.food }); // send to EJS view
    } catch (err) {
      console.error(err);
      res.status(500).send('API error');
    }
});
app.get('/autocomplete', async (req, res) => {
    const query = req.query.q;
  
    if (!query) return res.status(400).json({ error: "Missing query" });
  
    try {
      const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          method: 'foods.search',
          search_expression: query,
          format: 'json'
        }
      });
  
      const results = response.data.foods.food.map(item => ({
        id: item.food_id,
        name: item.food_name
      }));
  
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "API request failed" });
    }
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
app.get("/nutritional", isAuthenticated, async(req, res) => {
    res.render('nutritional.ejs');
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

