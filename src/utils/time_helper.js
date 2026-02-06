const getMinuteStart = (date) => {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
};
module.exports = { getMinuteStart };