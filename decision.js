// bid:{price, count}; ask:{price, count}; historyBuy: [{type, price, amount}]
function makeDecision(bid, ask, historyBuy) {
    if (ask.price > bid.price) {
        return {'type': 'buy', 'rate': bid.price, 'amount': bid.count};
    }
    return 0;
}

module.exports = makeDecision;