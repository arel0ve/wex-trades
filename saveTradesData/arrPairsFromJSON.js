function getFromJSON(strJSON) {
    return new Promise ((resolve, reject) => {
        try {
            let tempCurrObj = JSON.parse(strJSON);

            let currArr = [];
            for (let pair in tempCurrObj) {
                if (tempCurrObj.hasOwnProperty(pair)) {

                    currArr.push({
                        currency: pair,
                        data: tempCurrObj[pair]
                    });

                }
            }

            resolve(currArr);

        } catch (e) {
            reject(new Error('Bad response for JSON.parse'));
        }
    });
}

module.exports = getFromJSON;