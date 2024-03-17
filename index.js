import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "9354797837Dd@",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let result = await db.query("SELECt * FROM users");
let users = result.rows;

async function checkColor(){
  const res = await db.query("select color FROM users where id = $1 ",[currentUserId]);
  console.log(res.rows);
  const color = res.rows[0].color;
  return color;
}
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: "teal",
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  console.log(req.body.user);

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code,user_id) VALUES ($1,$2)",
        [countryCode,currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if(req.body.add=="new"){
    res.render("new.ejs");
  }else{
  currentUserId = req.body.user;
  const countries = await checkVisisted();
  const user_color = await checkColor();
  console.log(req.body);
  res.render("index.ejs",{
    countries: countries,
    total: countries.length,
    users: users,
    color: user_color,
  })
}
});

app.post("/new", async (req, res) => {
 
  let new_user = req.body.name;
  let color = req.body.color;
  const result = await db.query("INSERT INTO users (name,color) VALUES ($1,$2) RETURNING *" ,[new_user,color])
  console.log(result.rows);
  const id = result.rows[0].id;
  currentUserId = id;
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});









