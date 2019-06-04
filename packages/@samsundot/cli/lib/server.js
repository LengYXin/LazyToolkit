const inquirer = require('inquirer');
const semver = require('semver');
const detect = require('detect-port');
const app = require("../server/app");

module.exports = (options) => {
    options = { port: 8000, ...options };
    const port = options.port;
    // console.log("server: options", options)
    detect(port, (err, _port) => {
        if (err) {
            console.log(err);
        }
        // if (port == _port) {
        //     console.log(`port: ${port} was not occupied`);
        // } else {
        //     console.log(`port: ${port} was occupied, try port: ${_port}`);
        // }
        // console.log("TCL: _port", _port)
        new app(_port).run();
    });
}

