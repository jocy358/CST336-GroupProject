import express from 'express';
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('login')
});
app.get('/home', (req, res) => {
  res.render('home')
});
app.get('/signup', (req, res) => {
  res.render('signup')
});

app.listen(3000, () => {
   console.log('server started');
});