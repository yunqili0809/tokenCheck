require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Dummy users array for demonstration purposes
const users = [
  {
    id: 1,
    username: 'user1',
    // In a real application, you should save hashed passwords. Hashing is done here for demonstration.
    password: bcrypt.hashSync('password1', 10)
  },
  {
    id: 2,
    username: 'user2',
    password: bcrypt.hashSync('password2', 10)
  }
];

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && bcrypt.compareSync(password, u.password));

  if (user) {
    // Create JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.send('Username or password incorrect');
  }
});

// Protected route
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected resource accessed with a valid token!' });
});

app.get('/', (req, res) => {
  res.send('JWT Authentication Server is running. Use /login to obtain a token and /protected to access protected resources.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
