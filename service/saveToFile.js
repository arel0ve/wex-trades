const fs = require('fs');

function saveToFile(path, obj, parameterInfo, currency) {
    return new Promise((resolve, reject) => {
        fs.open(path, 'a', (err, fd) => {
            if (err) {
                reject(new Error(`Troubles in opening file '${path}'`));
                return;
            }

            fs.write(fd, JSON.stringify(obj, null, 1), (ew, size) => {
                if (ew) {
                    reject(new Error(`Troubles in writing to file '${path}'`));
                    return;
                }

                fs.close(fd, (ec) => {
                    if (ec) {
                        reject(new Error(`Troubles in closing file '${path}'`));
                        return;
                    }

                    let fileName = (~path.indexOf('/')) ? path.slice(path.indexOf('/') + 1) : path;

                    resolve({
                        fileName,
                        size,
                        info: obj[parameterInfo],
                        savedObj: {
                            currency,
                            [parameterInfo]: obj
                        }
                    });
                })
            })
        });
    });
}

module.exports = saveToFile;