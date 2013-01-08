var users = [
    { id: '1', username: 'mark', password: 'password', name: 'Mark Cox' },
    { id: '2', username: 'tyler', password: 'password', name: 'Tyler Power' },
    { id: '3', username: 'greg', password: 'password', name: 'Greg Baguley' }
];


exports.find = function(id, done) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.id === id) {
            return done(null, user);
        }
    }
    return done(null, null);
};

exports.findByUsername = function(username, done) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return done(null, user);
        }
    }
    return done(null, null);
};
