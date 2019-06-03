#!/usr/bin/env node
const program = require('commander')
program
    .version(require('../package').version)
    .usage('<command> [options]');

program
    .command('create <project-name>')
    .description('创建新的项目')
    .action((name, cmd) => {
        const options = cleanArgs(cmd)
        require('../lib/create').create(name, options);
    });
program
    .command('server [options]')
    .description('启动服务')
    .option('-p, --port <port>', '替换默认端口')
    .action((event, cmd) => {
        const options = cleanArgs(cmd)
        require('../lib/server')(options);
    });
program
    .parse(process.argv);
// console.log(program.commands)
function cleanArgs(cmd) {
    const args = {}
    cmd.options.forEach(o => {
        const key = camelize(o.long.replace(/^--/, ''))
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key]
        }
    })
    return args
}
function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}