var clients = [
    { id: '1', name: 'Appsecute', clientId: 'appsecute', clientSecret: 'not-really-so-secret' }
];


exports.find = function(id, done) {
    for (var i = 0, len = clients.length; i < len; i++) {
        var client = clients[i];
        if (client.id === id) {
            return done(null, client);
        }
    }
    return done(null, null);
};

exports.findByClientId = function(clientId, done) {
    for (var i = 0, len = clients.length; i < len; i++) {
        var client = clients[i];
        if (client.clientId === clientId) {
            return done(null, client);
        }
    }
    return done(null, null);
};
