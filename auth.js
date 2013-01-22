/**
 * Module dependencies.
 */
var passport = require('passport')
  , AppsecuteStrategy = require('./lib/passport-appsecute/passport-appsecute').Strategy
  , BearerStrategy = require('passport-http-bearer').Strategy

var appsecuteConnectorApi = require('appsecute-connector-api');

var db = require('./lib/db');


/**
 * Add OAuth authentication through Appsecute for users to log in.
 * We store the resulting appsecute access token against the user profile in our users store.
 */
passport.use('appsecute', new AppsecuteStrategy({
        clientID: 'tender-connector',
        clientSecret: 'tender-secret',
        callbackURL: '/auth/appsecute/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        db.users.findOrCreate(
            profile.id,
            profile.username,
            null, // no password
            profile.displayName,
            function(err, user) {
                // Store the access token and refresh token
                user.appsecuteAccessToken = accessToken;
                user.appsecuteRefreshToken = refreshToken;

                done(err, user);
        });
    }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.users.find(id, function (err, user) {
    done(err, user);
  });
});


/**
 * BearerStrategy
 *
 * This strategy is used to authenticate client applications who signed in using OAuth.
 * Normally this would be Appsecute wanting to take some sort of action through an API.
 * users based on an access token (aka a bearer token).
 * The user must have previously authorized a client application with the authorization server,
 * in this case Appsecute's OAuth2 server.
 */
passport.use(new BearerStrategy(function(accessToken, done) {
    // Try looking up the access token in our local cache
    db.accessTokens.find(accessToken, function(err, token) {
        if (err) { return done(err); }
        if (token) {
            console.log("Found access token in cache: " + accessToken.slice(0, 4) + "...");

            // Token already known about so look up user (who must already exist)
            db.users.find(token.userID, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }

                var info = { scope: '*' } // TODO: Add scope from token
                done(null, user, info);
            });
        }
        else {
            console.log("Access token not in cache: " + accessToken.slice(0, 4) + "... checking token with Appsecute");

            // Token not found in store; go ask Appsecute
            appsecuteConnectorApi.getOAuthTokenInfo(
                process.env.APPSECUTE_SECRET,
                accessToken,
                function(tokenInfo) {
                    console.log("Got info about access token from Appsecute");

                    // Got information about token; add it to our in-memory store as a cache
                  // TODO: Handle revocation
                  db.accessTokens.save(
                      accessToken,
                      tokenInfo.user.id,
                      tokenInfo.client.client_id,
                      function(error, token) {
                          if(error) { done(err); }

                          // Find or create the user mentioned in the token
                          db.users.findOrCreate(
                              token.userID,
                              tokenInfo.user.display_name,
                              "", // no password
                              tokenInfo.user.display_name,
                              function(err, user) {
                                  if (err) { return done(err); }

                                  var info = { scope: '*' } // TODO: Add scope from token
                                  done(null, user, info);
                          });
                      });
                },
                function(error, res) {
                    console.log("Failed to fetch info about access token from Appsecute");

                    done(error); // Unable to fetch information about token from Appsecute
                }
            );
        }
    });
}));
