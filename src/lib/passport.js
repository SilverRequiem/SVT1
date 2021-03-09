const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    console.log(req.body);

    const rows = await pool.query('SELECT * FROM usuario WHERE username = ?', [username]);
    if (rows.length > 0 ) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password);
        if (validPassword) {
            done(null, user, req.flash('success', 'Bienvenido' + user.fullname));
        } else {
            done(null, false, req.flash('message', 'Contraseña invalida'));
        }
    } else {
        return done (null, false,  req.flash('message', 'El usuario ingresado no existe'));
    }
}));

passport.use('local.signup', new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username, password, done) =>{
    const { fullname } = req.body;
    const newUser = {
        fullname, 
        username, 
        password
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO usuario SET ?', [newUser]);
    newUser.id = result.insertId;
    return done(null, newUser);
}));

passport.serializeUser((user, done) =>{
    done(null, user.ID);
});

passport.deserializeUser(async (id, done) =>{
    const rows = await pool.query('SELECT * FROM usuario WHERE ID = ?', [id]);
    done(null, rows[0]);
});

