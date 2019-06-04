const res = require("../../model/res");
const tool = require("../../utils/tool");
const ora = require("ora");
const fs = require('fs-extra');
const log = require('../../../utils/log');
const path = require("path");
const templateServer = require('../../utils/templateServer/analysis');

module.exports = async (ctx, next)=>{
    const components = ctx.request.body;

    const spinner = ora('创建组件').start();
    // log.success("@@@@@参数", components)
    try {
        // // 清空目录
        fs.emptyDirSync(global.config.temporaryPath);
        global.config.deleteList = [];
        // 创建成功的组件
        const successList = [];
        for (let index = 0, length = components.length; index < length; index++) {
            const component = components[index];
            try {
                const fsPath = path.join(global.config.containersPath, component.componentName);
                // 创建临时文件
                const temporaryPath = path.join(global.config.temporaryPath, component.componentName);
                // 模板服务
                const analysis = new templateServer(temporaryPath);
                tool.mkdirSync(temporaryPath);
                spinner.text = '创建 ' + component.componentName;
                tool.createTemporary(component.template, temporaryPath);
                // 写入配置文件。
                // spinner.text = 'Create pageConfig';
                fs.writeJsonSync(path.join(temporaryPath, "pageConfig.json"), component, { spaces: 4 });
                fs.ensureFileSync(path.join(temporaryPath, component.name + ".md"))
                // spinner.text = 'analysis template';
                await analysis.render();
                successList.push(component);
                // log.success("创建 " + component.componentName);
                // 创建目录
                tool.mkdirSync(fsPath);
                // 拷贝生成组件
                tool.copy(temporaryPath, fsPath);
                // 删除临时文件
                fs.removeSync(temporaryPath);
            } catch (error) {
                log.error("创建失败 ", component.componentName);
                log.error("error-", error);
            }
        }
        spinner.stop();
        // 写入路由
        tool.writeRouters(successList, 'add');
        // 生成导出
        tool.writeContainers();
        //  修改 页面配置 模型
        log.success("创建 ", successList.map(x => x.componentName).join(' / '));
        // spinner.text = 'writeRouters';
    } catch (error) {
        log.error("error", error);
        // throw error
        return res.error(ctx, error);
    } finally {
        // spinner.stop();
    }

    res.success(ctx, true);
};
