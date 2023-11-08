// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Load users (you should replace this with a database)
const users = [
    { id: 1, username: 'user1', password: 'hello' },
    // Add more users here
];

passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username);
        if (!user) return done(null, false, { message: 'Incorrect username' });
        if (!bcrypt.compareSync(password, user.password)) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Routes for authentication
app.post('/login', passport.authenticate('local', {
    successRedirect: '/tyler.html',
    failureRedirect: '/'
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Comments handling
app.use(bodyParser.json());

app.post('/add-comment', (req, res) => {
    const { username, comment } = req.body;
    if (username && comment) {
        const newComment = { username, comment };
        const comments = JSON.parse(fs.readFileSync('comments.json'));
        comments.push(newComment);
        fs.writeFileSync('comments.json', JSON.stringify(comments, null, 2));
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/get-comments', (req, res) => {
    const comments = JSON.parse(fs.readFileSync('comments.json'));
    res.json(comments);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

