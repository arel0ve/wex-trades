// const http = require('http');
// const url = require('url');

const log = require('./log')(module);
const request = require('./service/requestPromises');

const saveDeals = require('./saveTradesData/saveDeals');
const pairsFromJSON = require('./saveTradesData/arrPairsFromJSON');
const saveDifs = require('./saveTradesData/saveDifs');
const saveValidity = require('./saveTradesData/saveValidity');
const accValidity = require('./accValidity');

const COUNT_TRADES = 10;

const CURRENCY_PAIRS = [
    'ltc_usd',
    'eur_usd',
    'btc_usd',
    'eth_usd',
    'dsh_usd'
];


let wex = request.createSecured('wex.nz');

let tradesQuery = '/api/3/trades/'
    , depthQuery = '/api/3/depth/';

for (let pair of CURRENCY_PAIRS) {
    tradesQuery += `${pair}-`;
    depthQuery += `${pair}-`;
}
tradesQuery = request.createQuery(tradesQuery.slice(0, -1), {limit: COUNT_TRADES});
depthQuery = request.createQuery(depthQuery.slice(0, -1), {limit: 1});


// setInterval(()=> {
//     wex.get(tradesQuery)
//         .then(response => {
//             return pairsFromJSON(response);
//         })
//         .then(arrCurrency => {
//             return Promise.all( arrCurrency.map(saveDeals) );
//         })
//         .then(written => {
//             for (let saved of written) {
//                 if (!!saved.size) {
//                     log.info(`Saved ${saved.info} deals to file '${saved.fileName}' with size: ${saved.size}.`);
//                 }
//             }
//         })
//         .catch(err => {
//             log.error(err);
//         });
// }, 2000);


setInterval(()=> {
    wex.get(depthQuery)
        .then(response => {
            return pairsFromJSON(response);
        })
        .then(arrCurrency => {
            return Promise.all( arrCurrency.map(saveDifs) );
        })
        .then(arrDifs => {
            let validity = [];
            for (let saved of arrDifs) {
                if (!!saved.size) {
                    log.info(`Saved ${saved.info} difs to file '${saved.fileName}' with size: ${saved.size}.`);
                    validity.push(saved.savedObj);
                }
            }
            return Promise.all( validity.map(saveValidity) );
        })
        .then(written => {
            let validity = [];
            for (let saved of written) {
                if (!!saved.size) {
                    log.info(`Saved validity = ${saved.info} to file '${saved.fileName}' with size: ${saved.size}.`);
                    validity.push(saved.savedObj);
                }
            }
            return Promise.all( validity.map(accValidity) )
        })
        .then(deals => {
            for (let saved of deals) {
                if (!!saved.size) {
                    log.info(`It was ${saved.info} on ${saved.savedObj.currency} with price ${saved.savedObj.doTrade.price}.`);
                }
            }
        })
        .catch(err => {
            log.error(err);
        });
}, 1000);
