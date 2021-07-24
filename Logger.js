const fs = require('fs');

const Logger = log => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    fs.appendFileSync("server.log", `[${dateTime}]: ${log}\n`)
};

module.exports = Logger;
