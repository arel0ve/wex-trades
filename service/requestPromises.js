const http = require('http');
const https = require('https');

const querystring = require('querystring');

class requestPromises {

    constructor(hostname, isSecured = false, headers) {
        this.hostname = hostname;
        this.isSecured = isSecured;
        this.setHeaders(headers);
    }

    static createSecured(hostname, headers) {
        return new requestPromises(hostname, true, headers);
    }

    static createOpen(hostname, headers) {
        return new requestPromises(hostname, false, headers);
    }

    getHeaders() {
        return this.headers;
    }

    clearHeaders() {
        let isEmpty = !!this.headers;
        this.headers = null;
        return isEmpty;
    }

    setHeaders(newHeaders) {
        if (!newHeaders) {
            this.headers = null;
            return;
        }
        this.headers = {};
        this.addHeaders(newHeaders);
    }

    addHeaders(newHeaders) {
        if (!this.headers && newHeaders) {
            this.headers = {};
        }

        for (let header in newHeaders) {
            if (newHeaders.hasOwnProperty(header)) {
                this.headers[header.toString()] = newHeaders[header].toString();
            }
        }
    }

    get(path) {
        return this.__emitRequest(path);
    }

    post(path, postData) {
        return this.__emitRequest(path, postData);
    }

    static createQuery(path, parameters) {
        if (!parameters) {
            return path;
        }
        return `${path}?${querystring.stringify(parameters)}`;
    }


    __emitRequest(path, postData) {
        return new Promise((resolve, reject) => {

            let options = {
                method: 'GET',
                hostname: this.hostname,
                path
            };

            if (postData) {
                options.method = 'POST';
                this.addHeaders({ 'Content-Length': Buffer.byteLength(postData) });
            }

            if (this.headers) {
                options.headers = this.headers;
            }

            const request = __getMethod(this.isSecured)(options, (response) => {
                let result = "";

                response.on('data', (chunk) => {
                    switch(response.statusCode) {
                        case 200:
                            result += chunk;
                            break;
                        case 400:
                            reject(new Error('400 - Bad request'));
                            break;
                        case 404:
                            reject(new Error('404 - Not found'));
                            break;
                        default:
                            reject(new Error(`${response.statusCode}`));
                            break;
                    }
                });

                response.on('end', () => {
                    resolve(result);
                });

            });

            request.on('error', (e) => {
                reject(new Error(`500 - problem with request ${e.message}`));
            });

            if (postData) {
                request.write(postData);
            }

            request.end();

        });
    }

}


function __getMethod(isSecured) {
    if (isSecured) {
        return https.request;
    } else {
        return http.request;
    }
}

module.exports = requestPromises;