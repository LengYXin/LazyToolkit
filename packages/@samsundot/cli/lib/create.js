const inquirer = require('inquirer');
const semver = require('semver');
const fs = require('fs-extra');
const child_process = require('child_process')
const download = require('../utils/download');
const log = require('../utils/log');
const path = require('path');
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
        const projectPath = path.join(rootPath, name);
        // 判断当前路径是否为空
        const exists = await fs.pathExists(projectPath);
        if (exists) {
            log.error(`已经存在 项目 ${name}`);
        } else {
            const options = await this.initOptions();
            this.options = { ...this.options, ...options };
            await this.download(projectPath);
            console.log("TCL: CreateProject -> create -> this.options", this.options)
            log.success("成功")
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
     * 创建项目
     * @param {*} projectPath 项目根路径
     */
    async  download(projectPath) {
        const gitUrl = packageConfig.publishConfig[this.options.template].url;
        console.log("TCL: CreateProject -> download -> gitUrl", gitUrl)
        return
        return download(gitUrl, projectPath)
    }
    async install() {
        try {
            child_process.execSync('yarn --version', { stdio: 'ignore' })
            return true
        } catch (e) {
            return false
        }
    }
}

module.exports = new CreateProject();
