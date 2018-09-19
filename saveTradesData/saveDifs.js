const fs = require('fs');

const getTime = require('../service/getTime');
const saveToFile = require('../service/saveToFile');

// {
//      currency: currencyPair,
//      depth:{asks:[[price, amount]], bids:[[price, amount]]},
//      lastDeals:[{type, price, amount, tid, timestamp}]},
//      ticker: {high, low, avg, vol, vol_cur, last, buy, sell, updated}
//  }


saveDifs.__dif = {};

function saveDifs({currency, data}) {
    return new Promise((resolve, reject) => {
        let dif = ( (+data.asks[0][0]) / (+data.bids[0][0]) - 1) * 100;

        let dir = getDirectory(dif);

        if (!dir) {
            resolve({
                fileName: `/NaN/${currency}.json`,
                dif,
                size: 0
            });
            return;
        }

        if ( !saveDifs.__dif[currency] ) {
            saveDifs.__dif[currency] = {};
            saveDifs.__dif[currency].dif = dif;
            saveDifs.__dif[currency].dir = dir;
            saveDifs.__dif[currency].ask = data.asks[0];
            saveDifs.__dif[currency].bid = data.bids[0];
            saveDifs.__dif[currency].start = new Date();
        }

        if (dif !== saveDifs.__dif[currency].dif) {

            let toSave = {
                dif: `${saveDifs.__dif[currency].dif}%`,
                ask: saveDifs.__dif[currency].ask,
                bid: saveDifs.__dif[currency].bid,
                start: saveDifs.__dif[currency].start,
                end: new Date()
            };

            toSave.during = new Date(toSave.end - toSave.start).getSeconds();
            toSave.start = getTime(toSave.start);
            toSave.end = getTime(toSave.end);


            let saveDir = saveDifs.__dif[currency].dir;

            saveToFile(`difs/${saveDir}/${currency}.json`, toSave, 'dif', currency)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                });

            saveDifs.__dif[currency].dif = dif;
            saveDifs.__dif[currency].dir = dir;
            saveDifs.__dif[currency].ask = data.asks[0];
            saveDifs.__dif[currency].bid = data.bids[0];
            saveDifs.__dif[currency].start = new Date();

        } else {
            resolve({
                fileName: `/${dir}/${currency}.json`,
                dif,
                size: 0
            });
        }


    });
}


function getDirectory(dif) {
    let start = Math.floor(dif * 10);
    start = (start > 10) ? 10 : start;
    start = start / 10;
    start = (start < 0) ? '-' : start;
    start = (start === 0) ? '0.0' : start;
    start = (start === 1) ? '1.0' : start;
    start = start + '';

    let end = Math.floor(dif * 10) + 1;
    end = (end < 0) ? 0 : end;
    end = end / 10;
    end = (end > 1) ? '-' : end;
    end = (end === 0) ? '0.0' : end;
    end = (end === 1) ? '1.0' : end;
    end = end + '';

    return `${start}-${end}`;
}


module.exports = saveDifs;