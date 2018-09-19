function getTime(date) {
    let h = date.getHours();
    h = (h < 10) ? ('0' + h) : h;

    let m = date.getMinutes();
    m = (m < 10) ? ('0' + m) : m;

    let s = date.getSeconds();
    s = (s < 10) ? ('0' + s) : s;
    return `${h}:${m}:${s}`;
}

module.exports = getTime;