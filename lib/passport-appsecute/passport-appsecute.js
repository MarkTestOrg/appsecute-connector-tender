/**
 * Appsecute passport OAuth client.
 */
var util = require('util')
    , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
    , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * The base URL to the Appsecute api; can be configured through environment for private instances of Appsecute.
 */
var appsecuteUrl = process.env.APPSECUTE_URL || 'https://appsecute.appsecute-next.jit.su';


/**
 * The Appsecute authentication strategy authenticates requests by delegating to
 * Appsecute using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and `profile` (Appsecute-specific), and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred then`err` should be set.
 *
 * Options:
 *   - `clientID`      your Appsecute application's Client ID
 *   - `clientSecret`  your Appsecute application's Client Secret
 *   - `callbackURL`   URL to which Appsecute will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *   TODO: fill out valid Appsecute scopes here
 *                     'user', or none.
 *
 * Examples:
 *
 *     passport.use(new AppsecuteStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'this-is-a-secret'
 *         callbackURL: 'https://www.example.net/auth/appsecute/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || appsecuteUrl + '/oauth/authorize';
    options.tokenURL = options.tokenURL || appsecuteUrl + '/oauth/token';
    options.scopeSeparator = options.scopeSeparator || ',';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'appsecute';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Appsecute.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `github`
 *   - `id`               the user's GitHub ID
 *   - `username`         the user's GitHub username
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on GitHub
 *   - `emails`           the user's email addresses
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
    var profileUrl = appsecuteUrl + '/users/current';

    this._oauth2.get(
        profileUrl,
        accessToken,
        function (err, body, res) {
            if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

            try {
                var userDetails = JSON.parse(body);

                // Translate our appsecute profile fields into the standard fields used by passport,
                // which conform to the contact schema established by Portable Contacts. See:
                // http://passportjs.org/guide/profile/
                var profile = { provider: 'appsecute' };
                profile.id = userDetails._id;  // Must have underscore since 'id' property was dynamic
                profile.displayName = userDetails.display_name;
                profile.username = userDetails.oauth_external_id;
                profile.profileUrl = profileUrl;
                profile.emails = [{ value: userDetails.email }];

                profile._raw = body;
                profile._json = userDetails;

                done(null, profile);
            } catch(e) {
                done(e);
            }
        }
    );
}


module.exports.Strategy = Strategy;
