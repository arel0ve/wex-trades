const fs = require('fs');

const getTime = require('../service/getTime');
const saveToFile = require('../service/saveToFile');

// {
//      currency: currencyPair,
//      data:[{type, price, amount, tid, timestamp}]
//  }

saveDeals.__last = {};

function saveDeals({currency, data}) {
    return new Promise((resolve, reject) => {

        if (!saveDeals.__last[currency]) {
            saveDeals.__last[currency] = 0;
        }

        let toSave = [];
        let i = 0;
        while (i < data.length && data[i].tid !== saveDeals.__last[currency]) {
            let timeDeal = new Date(data[i].timestamp * 1000);
            toSave.push({
                type: data[i].type,
                price:data[i].price,
                amount: data[i].amount,
                time: getTime(timeDeal)
            });
            i++;
        }

        saveDeals.__last[currency] = data[0].tid;

        if (toSave.length > 0) {

            saveToFile(`dealsHistory/${currency}.json`, toSave, 'length', currency)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                });

        } else {
            resolve({
                fileName: `${currency}.json`,
                countDeals: toSave.length,
                size: 0
            });
        }
    });

}

module.exports = saveDeals;