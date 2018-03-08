


import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import connectMongo from 'connect-mongo'; 
const MongoStore = connectMongo(session);
import mongoose from 'mongoose';
import crypto from 'crypto';
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/homazondb", function(err, db) {
if(err) {
console.log('Nope', err);
} else {
console.log('Success')
}
})

import index from './routes/index';
import users from './routes/users';
import {User} from "./models";
import {Product} from "./models";

var app = express();

app.use(session({
  secret:'thug life$$',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));


// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
    function hashPassword(password){
      var hash= crypto.createHash('sha256');
      hash.update(password);
      return hash.digest('hex')
    };
    User.findOne({ username: username }, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) { 
        console.log(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false, { message: 'Incorrect username.' });
      }
      // if passwords do not match, auth failed
      if (user.password !== hashPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      // auth has has succeeded
      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
