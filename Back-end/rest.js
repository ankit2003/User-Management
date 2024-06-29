const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const redis = require('redis');
const path = require('path');
const cors = require('cors');

// Redis client setup
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Use CORS middleware
app.use(cors({
  origin: 'http://192.168.3.12:8080', // Change this to your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check cache
function cache(req, res, next) {
  const { id } = req.params;
  if (!id) {
    return next();
  }

  redisClient.get(`user:${id}`, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.json(JSON.parse(data));
    } else {
      next();
    }
  });
}

// Read all users
app.get('/', (req, res) => {
  fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    res.end(data);
  });
});

// Read user by ID
app.get('/:id', cache, (req, res) => {
  fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const user = users[`user${req.params.id}`];
    if (user) {
      redisClient.setex(`user:${req.params.id}`, 3600, JSON.stringify(user));
      res.json(user);
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Create user
app.post('/', (req, res) => {
  fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const newUser = req.body.user4;
    users[`user${newUser.id}`] = newUser;
    fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
      if (err) throw err;
      res.json(users);
    });
  });
});

// Update user
app.put('/:id', (req, res) => {
  fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    users[`user${req.params.id}`] = req.body;
    fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
      if (err) throw err;
      res.json(users);
    });
  });
});

// Delete user
app.delete('/:id', (req, res) => {
  fs.readFile(__dirname + '/users.json', 'utf8', (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    delete users[`user${req.params.id}`];
    fs.writeFile(__dirname + '/users.json', JSON.stringify(users), (err) => {
      if (err) throw err;
      res.json(users);
    });
  });
});

// Serve static files (index.html, app.js, etc.)
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(5000, () => {
  console.log('Express app running at http://127.0.0.1:5000/');
});
