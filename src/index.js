const express = require ('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mysqlSession = require('express-mysql-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const cors = require('cors');




const {database} = require('./keys');

//inicializaciones
const app = express();

require('./lib/passport');

//configuracion
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');


//middlewares
app.use(session({
    secret: 'silverrequiem',
    resave: false,
    saveUninitialized: false,
    store: new mysqlSession(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});
app.use(cors())





//variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});


//rutas
app.use(require('./routes'));
app.use(require('./routes/autenticacion'));
app.use(require('./routes/files'));
app.use('/links', require('./routes/links'));


//public
app.use(express.static(path.join(__dirname, 'public')));

//inicializacion del servidor
app.listen(app.get('port'), () => {
    console.log('servidor en el puerto', app.get('port'))
});

