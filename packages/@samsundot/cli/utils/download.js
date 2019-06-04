const download = require('download-git-repo')
const ora = require('ora');
const log = require('./log');
/**
 * 下载模板
 */
module.exports = (repo, dest, options = {}) => {
    const spinner = ora(options.start || `下载模板...`).start();
    return new Promise((resolve, reject) => {
        // 下载 git 模板
        spinner.start();
        download(repo, dest, options, (err) => {
            spinner.stop();
            if (err) {
                log.error(options.error || "下载失败");
                reject(err)
            } else {
                log.success(options.success || "下载完成");
                resolve(dest)
            }
        })
    })
}