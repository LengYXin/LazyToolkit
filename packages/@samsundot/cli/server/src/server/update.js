const res = require("../../model/res");
const tool = require("../../utils/tool");
const templateServer = require('../../utils/templateServer/analysis');
const log = require('../../../utils/log');
const fs = require('fs-extra');
const path = require("path");


module.exports = async (ctx, next)=>{
    const body = ctx.request.body;

    const { component, key, name } = body;
    try {
        fs.emptyDirSync(global.config.temporaryPath);
        
        const fsPath = path.join(global.config.containersPath, component.componentName);
        // 创建临时文件
        const temporaryPath = path.join(global.config.temporaryPath, component.componentName);
        // 模板服务
        const analysis = new templateServer(temporaryPath);
        tool.mkdirSync(temporaryPath);
        tool.createTemporary(component.template, temporaryPath);
        // 写入配置文件。
        // spinner.text = 'Create pageConfig';
        fs.writeJsonSync(path.join(temporaryPath, "pageConfig.json"), component, { spaces: 4 });
        // spinner.text = 'analysis template';
        await analysis.render();
        // 创建目录
        tool.mkdirSync(fsPath);
        // 拷贝生成组件
        tool.copy(temporaryPath, fsPath);
        // 删除临时文件
        fs.removeSync(temporaryPath);
        // 写入路由
        tool.writeRouters(component, 'updaste');
        log.success("修改 ", `${name} to ${component.componentName}`);
        if (component.componentName == name) {
            tool.writeContainers();
            return res.success(ctx, true);;
        }
        global.config.deleteList.push(name);
        // 生成导出
        // this.writeContainers();
        // return new Promise((resole, reject) => {
            setTimeout(() => {
                fs.remove(path.join(global.config.containersPath, name), error => {
                    // if (error) {
                    //     reject(error)
                    // }
                    // resole(true);
                    // res.success(ctx, true);
                    // 生成导出
                    tool.writeContainers();
                });
            }, 500);
        // })
    } catch (error) {
        log.error("修改失败 ", component.componentName);
        log.error("error-", error);
        return res.error(ctx, error);
    }

    res.success(ctx, true);
};
