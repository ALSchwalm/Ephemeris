({
    baseUrl: 'site/js/lib',
    paths: {
        // Phaser does not fully support require js by default, so
        // we need to explicitly add it to the config
        Phaser: 'phaser',
        socketio: '../../../node_modules/socket.io/node_modules/socket.io-client/socket.io',

        // All application files can be required with 'app/<name>'
        app: '../app'
    },
    name : "../app",
    out : "site/js/ephemeris-built.js"
})
