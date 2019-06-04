const res = require("../../model/res");
const tool = require("../../utils/tool");
const templateServer = require('../../utils/templateServer/analysis');
const log = require('../../../utils/log');
const fs = require('fs-extra');
const path = require("path");


module.exports = async (ctx, next)=>{
    const component = ctx.request.body;

    try {
        // 防止操作太快。
        if (new Date().getTime() - global.config.deleteTime <= 3000) {
            throw "操作太快,请等待3秒后再试"
        }
        global.config.deleteTime = new Date().getTime();
        global.config.deleteList.push(component.name);
        tool.writeContainers();
        tool.writeRouters(component, 'delete');
        const conPath = path.join(global.config.containersPath, component.name)
        log.success("delete " + component.name);
        // setTimeout(() => {
        // return fs.remove(conPath)
        // return new Promise((resole, reject) => {
            setTimeout(() => {
                fs.remove(conPath, error => {
                    // if (error) {
                    //     reject(error)
                    // }
                    // resole(true);
                    // 生成导出
                    // this.writeContainers();
                });
            }, 500);
        // })
        // rimraf.sync(conPath);
        // }, 500);
    } catch (error) {
        log.error("delete ", error);
        throw error
        return res.error(ctx, error);
    }

    res.success(ctx, true);
};
