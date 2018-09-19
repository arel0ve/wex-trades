const fs = require('fs');
const saveToFile = require('../service/saveToFile');

// {
//     currency: currencyPair,
//     dif: {
//         dif: '0.xxxxxxxxxx%',
//         ask: [price, amount],
//         bid: [price, amount],
//         start: 'hh:mm:ss',
//         end: 'hh:mm:ss',
//         during: ss
//
//     }
// }

saveValidity.__density = {
    'btc_usd': 0.75,
    'eth_usd': 0.75,
    'ltc_usd': 0.8,
    'dsh_usd': 0.9
};

function saveValidity({currency, dif}) {
    return new Promise((resolve, reject) => {
        let different = +dif.dif.slice(0, -1);
        if (currency in saveValidity.__density && different > (saveValidity.__density[currency] - 0.05)) {

            let k = 0;
            if (different < saveValidity.__density[currency]) {
                k = 0.5;
            } else {
                k = Math.floor(different * 10) / 10;
                k = k - saveValidity.__density[currency];
                k = Math.round(k * 10) + 1;
                k = (k > 3) ? 5 : k;
            }

            let toSave = dif;
            toSave.validity = toSave.during * k;

            saveToFile(`difs/validity/${currency}.json`, toSave, 'validity', currency)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                });

        } else {
            resolve({
                fileName: `/validity/${currency}.json`,
                dif,
                size: 0
            });
        }
    });

}

module.exports = saveValidity;