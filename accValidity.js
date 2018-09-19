const getTime = require('./service/getTime');
const saveToFile = require('./service/saveToFile');

// {
//     currency: currencyPair,
//     dif: {
//         dif: '0.xxxxxxxxxx%',
//         ask: [price, amount],
//         bid: [price, amount],
//         start: 'hh:mm:ss',
//         end: 'hh:mm:ss',
//         during: ss,
//         validity: n
//
//     }
// }

accValidity.__toDecision = {
    'btc_usd': 10,
    'eth_usd': 10,
    'ltc_usd': 10,
    'dsh_usd': 10
};

accValidity.__delay = 60 * 60 * 1000;

accValidity.__vals = {};

function accValidity({currency, validity}) {
    return new Promise((resolve, reject) => { debugger;

        if (!accValidity.__vals[currency]) {

            accValidity.__vals[currency] = {};
            accValidity.__vals[currency].sum = validity.validity;
            accValidity.__vals[currency].time = new Date().getTime();

        } else if (new Date().getTime() - accValidity.__vals[currency].time < accValidity.__delay) {

            if (new Date().getTime() - accValidity.__vals[currency].time < accValidity.__delay / 6) {
                accValidity.__vals[currency].sum = accValidity.__vals[currency].sum / 2;
            }

            accValidity.__vals[currency].sum += validity.validity;


        } else {
            accValidity.__vals[currency].sum = validity.validity;
        }

        accValidity.__vals[currency].priceA = validity.ask[0];
        accValidity.__vals[currency].priceB = validity.bid[0];

        if (new Date().getTime() - accValidity.__vals[currency].time > accValidity.__delay / 2 &&
            accValidity.__vals[currency].sum > accValidity.__toDecision[currency]) {

            accValidity.__vals[currency].time = new Date().getTime();

            let doTrade = 0;
            let price = 0;

            if (!accValidity.__vals[currency].oldPriceA) {
                accValidity.__vals[currency].oldPriceA = accValidity.__vals[currency].priceA;
                accValidity.__vals[currency].oldPriceB = accValidity.__vals[currency].priceB;
                resolve({
                    currency,
                    size: 0,
                    acc: accValidity.__vals[currency]
                });
                return;

            } else if (accValidity.__vals[currency].priceA < accValidity.__vals[currency].oldPriceA) {
                doTrade = "buy";
                price = accValidity.__vals[currency].priceA;
            } else {
                doTrade = "sell";
                price = accValidity.__vals[currency].priceB;
            }

            let validSum = accValidity.__vals[currency].sum;

            accValidity.__vals[currency].sum = 0;
            accValidity.__vals[currency].oldPriceA = accValidity.__vals[currency].priceA;
            accValidity.__vals[currency].oldPriceB = accValidity.__vals[currency].priceB;

            let trade = {
                doTrade,
                price,
                time: getTime(new Date()),
                validity: validSum
            };

            saveToFile(`trades/${currency}.json`, trade, 'doTrade', currency)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                });

        } else {
            accValidity.__vals[currency].time = new Date().getTime();

            resolve({
                currency,
                size: 0,
                acc: accValidity.__vals[currency]
            });
        }

    });
}

module.exports = accValidity;