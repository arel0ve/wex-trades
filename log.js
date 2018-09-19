const winston = require('winston');


module.exports = function(module) {
    return makeLogger(module.filename);
};


function makeLogger(path) {
    let transports = getTransports(path);

    return new winston.Logger({ transports });
}


function getTransports(path) {
    let filename = null;

    if (path.match(/server.js$/)) {
        filename = 'debugLogs/debugServer.log';
    } else if (path.match(/decision.js$/)) {
        filename = 'debugLogs/debugDecision.log';

    } else {
        return [];
    }

    return [
        new winston.transports.Console({
            timestamp: true,
            colorize: true,
            level: 'info'
        }),

        new winston.transports.File ({
            filename,
            timestamp: true,
            maxsize: 1048576,
            maxFiles: 25,
            level: 'debug'
        })
    ];

}