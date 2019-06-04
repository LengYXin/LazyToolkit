const inquirer = require('inquirer');
const semver = require('semver');
const fs = require('fs-extra');
const child_process = require('child_process')
const download = require('../utils/download');
const log = require('../utils/log');
const path = require('path');
const lodash = require('lodash');

const rootPath = process.cwd();
const packageConfig = require('../package');
class CreateProject {
    async create(name, cmd) {
        this.options = {
            // 项目名称
            projectName: name,
            // 模板
            template: null,
            // swagger doc 地址
            swagger: null,
            // 执行npm install
            install: null,
        }
        // 项目根路径
        this.projectPath = path.join(rootPath, name);
        try {
            // 判断当前路径是否为空
            if (fs.pathExistsSync(this.projectPath)) {
                throw `已经存在 项目 ${name}`;
            } else {
                const options = await this.initOptions();
                this.options = { ...this.options, ...options };
                await this.download();
                this.update();
                await this.install();
                log.success("成功")
            }
        } catch (error) {
            log.error(error);
        }
    }
    /**
     * 初始化参数
     */
    initOptions() {
        const prompts = []
        const options = this.options
        // 模板
        const templateChoices = [{
            name: 'React',
            value: 'react'
        }, {
            name: 'Vue',
            value: 'vue'
        }]
        if (typeof options.template !== 'string') {
            prompts.push({
                type: 'list',
                name: 'template',
                message: '请选择模板',
                choices: templateChoices
            })
        } else {
            let isTemplateExist = false
            templateChoices.forEach(item => {
                if (item.value === options.template) {
                    isTemplateExist = true
                }
            })
            if (!isTemplateExist) {
                log.error('你选择的模板不存在')
                log.info('目前提供了以下模板以供使用:')
                console.log()
                templateChoices.forEach(item => {
                    console.log(chalk.green(`- ${item.name}`))
                })
                process.exit(1)
            }
        }
        if (typeof options.swagger !== 'string') {
            prompts.push({
                type: 'input',
                name: 'swagger',
                message: '请输入swagger-doc地址：'
            })
        }
        if (typeof options.install !== 'boolean') {
            prompts.push({
                type: 'confirm',
                name: 'install',
                message: '是否安装依赖？'
            })
        }

        return inquirer.prompt(prompts)
    }
    /**
     * 下载git项目
     * @param {*} projectPath 
     */
    async  download(projectPath = this.projectPath) {
        const gitUrl = lodash.get(packageConfig, `publishConfig[${this.options.template}].url`);
        if (gitUrl) {
            return download(gitUrl, projectPath)
        } else {
            throw "获取 下载地址失败";
        }
    }
    /**
     * 修改项目配置
     * @param {*} projectPath 
     */
    async  update(projectPath = this.projectPath) {
        const packagePath = path.join(projectPath, 'package.json');
        if (fs.pathExistsSync(packagePath)) {
            const packageObj = fs.readJsonSync(packagePath);
            packageObj.name = this.options.projectName;
            packageObj.version = "1.0.0";
            fs.writeJsonSync(packagePath, packageObj, { spaces: 4 });
        }
    }
    /**
     * 安装依赖
     * @param {} projectPath 
     */
    async install(projectPath = this.projectPath) {
        if (!this.options.install) {
            return
        }
        let spawn = null;
        if (this.shouldUseYarn()) {
            spawn = child_process.spawnSync(
                "yarn",
                ['install'],
                {
                    cwd: projectPath,
                    stdio: 'inherit',
                    shell: true,
                }
            )
        } else {
            // npm
            spawn = child_process.spawnSync(
                "npm",
                ['install --registry=https://registry.npm.taobao.org/'],
                {
                    cwd: projectPath,
                    stdio: 'inherit',
                    shell: true,
                }
            )
        }
        if (spawn.status == 1) {
            log.error(`安装项目依赖失败，请自行重新安装！`)
        }
    }
    shouldUseYarn() {
        try {
            const exec = child_process.execSync('yarn --version', { stdio: 'ignore' })
            return true
        } catch (e) {
            return false
        }
    }
}

module.exports = new CreateProject();
