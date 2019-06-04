const path = require("path");
const logger = require('../utils/log');

class Config{
    constructor(){
        this.root_path = process.cwd();//项目目录
        this.server_path = __dirname;//脚手架项目目录
        this.wtmfrontPath = path.join(this.root_path, 'wtmfront.config.js');//wtm配置路径
        this.wtmfrontConfig = require(this.wtmfrontPath);//wtm配置
        this.containersPath = path.join(this.root_path, this.wtmfrontConfig.containers);//容器组件路径
        this.subMenuPath = path.join(this.root_path, this.wtmfrontConfig.subMenu);//路由路径
        this.subMenuConfig = require(this.subMenuPath);//配有配置
        this.temporaryPath = path.join(__dirname, 'templateServer', "temporary");
        this.templates = [];//模板文件列表
        this.deleteList = [];//删除的列表
        this.deleteTime = new Date().getTime();
    }
}

if(!global.config) {
    global.config = new Config();
    logger.success("初始化模板服务配置成功", JSON.stringify(global.config))
}

module.exports = global.config;