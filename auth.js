/**
 * Module dependencies.
 */
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , BasicStrategy = require('passport-http').BasicStrategy
  , AppsecuteStrategy = require('./lib/passport-appsecute/passport-appsecute').Strategy
  , ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
  , BearerStrategy = require('passport-http-bearer').Strategy
  , db = require('./lib/db')



var appsecuteConnectorApi = require('appsecute-connector-api');


/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    });
  }
));


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
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
  function(username, password, done) {
    db.clients.findByClientId(username, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.clientSecret != password) { return done(null, false); }
      return done(null, client);
    });
  }
));

passport.use(new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
    db.clients.findByClientId(clientId, function(err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.clientSecret != clientSecret) { return done(null, false); }
      return done(null, client);
    });
  }
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(function(accessToken, done) {
    // Try looking up the access token in our local store
    db.accessTokens.find(accessToken, function(err, token) {
        if (err) { return done(err); }
        if (token) {
          // Token already known about so look up user (who must already exist)
          db.users.find(token.userID, function(err, user) {
              if (err) { return done(err); }
              if (!user) { return done(null, false); }

              var info = { scope: '*' } // TODO: Add scope from token
              done(null, user, info);
          });
        }
        else {
            // Token not found in store; go ask Appsecute
            appsecuteConnectorApi.getOAuthTokenInfo(
                process.env.APPSECUTE_SECRET,
                accessToken,
                function(tokenInfo) {
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
                    done(error); // Unable to fetch information about token from Appsecute
                }
            );
        }
    });
}));
