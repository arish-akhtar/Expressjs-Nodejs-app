const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis").default;

const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require("./config/config");

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const app = express();

const redisStore = new RedisStore({ client: redisClient });

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
mongoose
  .connect(mongoURL)
  .then(() => console.log("succesfully connected db"))
  .catch((e) => console.log(e));

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2>Hello There!!</h2>");
    console.log("yeah it ran")
});
app.enable("trust proxy");
app.use(session({
  store: redisStore,
  secret: SESSION_SECRET,
  cookie: {
    secure: false,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    maxAge: 600000,
  },
}));
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));

