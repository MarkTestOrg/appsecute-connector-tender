/**
 * Configures the express environment
 */

var url = require('url');

// Use passport for authentication
var passport = require('passport');

// Set up authentication using passport
require('./auth');


module.exports = function (app, express) {

    // General configuration, called regardless of environment
    //noinspection JSValidateTypes
    app.configure(function () {

        // We configure express to use body parser and built-in sessions (backed by MongoDB for persistence)
        app.use(express.compress());
        app.use(express.logger());
        app.use(express.bodyParser());
        app.use(express.cookieParser());

        if (process.env.APPSECUTE_SECRET) {
            console.info('Secret has been set. Connector is running securely and ready for production. (' +
                process.env.APPSECUTE_SECRET.substring(0, 4) + "...)");
        } else {
            console.warn('No secret has been set. Connector is running insecurely and not validating secrets. Don\'t run this in production.');
        }

        // Use sessions from express, with an explicit cookie name (key) to avoid conflicts.
        app.use(express.session({
            key:'appsecute-tender-con-sid',
            secret:'5RE@#pf54e2r!'
        }));

        // Use 'ejs' as the renderer for web pages
        app.set('view engine', 'ejs');

        // Set up passport for authentication
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);

        // Make sure it is in fact Appsecute calling the api
        app.all('*', function (req, res, next) {
            var path = url.parse(req.url).pathname;

            // Don't check Appsecute secret during OAuth interaction
            if (path !== '/oauth/authorize' && // OAuth 'grant access' URL
                path !== '/oauth/authorize/decision' && // Post back from form granting access
                path !== '/oauth/token' && // OAuth call to exchange authorization code for access token
                path !== '/login' && // Interactive user authentication
                path !== '/logout' && // Interactive user authentication
                path !== '/oauth' && // Interactive page
                path !== '/appsecute/after-auth' && // After authorization (effectively a login)
                path !== '/appsecute/after-auth/result' && // After authorization, posted form
                path !== '/auth/appsecute' && // Appsecute OAuth login screen
                path !== '/auth/appsecute/callback' // Appsecute OAuth login callback
                ) {
                if (!process.env.APPSECUTE_SECRET) {
                    console.warn('No secret has been set. Connector is running insecurely and not validating secrets. Don\'t run this in production.');
                    next();
                } else {
                    if (req.query.secret &&
                        req.query.secret === process.env.APPSECUTE_SECRET) {
                        next();
                    } else {
                        res.send(403); // Forbidden (access denied)
                    }
                }
            } else {
                next();
            }
        });

        // Log server response times
        app.all('*', function (req, res, next) {
            var start = new Date;

            if (res._responseTime) {
                next();
            }

            res._responseTime = true;

            res.on('header', function (header) {
                var duration = new Date - start;
                res.setHeader('X-Response-Time', duration + 'ms');
            });

            next();
        });
    });

    // Development specific configuration
    app.configure('development', function () {
        app.use(express.errorHandler({
            dumpExceptions:true,
            showStack:true
        }));
    });

    // Production specific configuration
    app.configure('production', function () {
        app.use(express.errorHandler());
    });
};