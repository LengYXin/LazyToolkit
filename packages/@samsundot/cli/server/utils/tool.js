const fs = require('fs-extra');
const path = require("path");
const lodash = require("lodash");
const log = require("../../utils/log");

class Tool{
    /**
     * 是否存在目录
     * @param {*} fsPath 
     */
    static exists(fsPath) {
        const exists = fs.pathExistsSync(fsPath);
        // console.log("exists：" + fsPath, exists);
        return exists
    }

    /**
     * 创建临时目录
     * @param {*} template 模板名称
     * @param {*} temporaryPath  临时目录
     */
    static createTemporary(template, temporaryPath) {
        if (template == null || template == "") {
            // template = "default";
            throw "没有找到模板文件"
        }
        let templatePath = path.join(global.config.root_path, global.config.wtmfrontConfig.template);

        fs.copySync(path.join(templatePath, template), temporaryPath);
    }

    /**
     * 拷贝文件
     * @param {*} from 
     * @param {*} to 
     */
    static copy(from, to) {
        fs.copySync(from, to)
        // log.info("create", to);
    }
    /**
     * 获取json
     */
    static readJSON(src) {
        return fs.readJsonSync(src);
    }

    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 创建目录
     * @param {*} fsPath 
     */
    static mkdirSync(fsPath) {
        fs.ensureDirSync(fsPath);
        // console.log("mkdirSync");
    }

     /**
     * 获取组件列表
     */
    static getContainersDir() {
        return fs.readdirSync(global.config.containersPath).filter(x => {
            const pathStr = path.join(global.config.containersPath, x, "pageConfig.json");
            // console.log(pathStr, this.exists(pathStr));
            return !global.config.deleteList.some(del => del == x) && this.exists(pathStr)
            // return fs.statSync(pathStr).isDirectory() && this.exists(path.join(pathStr, "index.tsx"))
        }).map(dir => {
            const pathStr = path.join(global.config.containersPath, dir, "pageConfig.json");
            try {
                const config = fs.readJsonSync(pathStr);
                return {
                    name: dir,
                    key: config.key,
                    pageConfig: config
                }
            } catch (error) {
                return {
                    name: dir,
                    pageConfig: error
                }
            }

        })
    }

    /**
     * 写入路由  菜单
     * @param {*} components 
     */
    static writeRouters(components, type = 'add') {
        if (this.exists(global.config.subMenuPath)) {
            // 读取路由json
            let routers = this.readJSON(global.config.subMenuPath);
            if (type == 'add') {
                components.map(component => {
                    const data = {
                        "Key": component.key,//唯一标识
                        "Name": component.menuName,//菜单名称
                        "Icon": component.icon,//图标
                        "Path": `/${component.componentName}`,//路径
                        "Component": component.componentName,//组件
                        // "Action": lodash.compact(lodash.toArray(lodash.mapValues(component.actions, (value, key) => {
                        //     if (value.state) {
                        //         value.key = key;
                        //         delete value.state;
                        //         return value
                        //     }
                        // }))),//操作
                        "Children": []//子菜单
                    }
                    routers.subMenu.push(data);
                })

            } else if (type == "updaste") {
                const data = {
                    "Key": components.key,//唯一标识
                    "Name": components.menuName,//菜单名称
                    "Icon": components.icon,//图标
                    "Path": `/${components.componentName}`,//路径
                    "Component": components.componentName,//组件
                    // "Action": lodash.compact(lodash.toArray(lodash.mapValues(components.actions, (value, key) => {
                    //     if (value.state) {
                    //         value.key = key;
                    //         delete value.state;
                    //         return value
                    //     }
                    // }))),//操作
                    "Children": []//子菜单
                }
                const index = lodash.findIndex(routers.subMenu, x => x.Key == components.key);
                lodash.fill(routers.subMenu, data, index, index + 1);
            } else {
                // 删除
                lodash.remove(routers.subMenu, (value) => {
                    return value.Key == components.key;
                })
            }
            // 写入json
            // editorFs.writeJSON(path.join(this.contextRoot, "src", "app", "a.json"), routers);
            fs.writeJsonSync(global.config.subMenuPath, routers, { spaces: 4 });
            // log.success("writeRouters " + type, JSON.stringify(components, null, 4));
        } else {
            log.error("没有找到对应的路由JSON文件");
        }
    }

    /**
     * 写入组件导出
     */
    static writeContainers() {
        // 获取所有组件，空目录排除
        const containersDir = this.getContainersDir();
        let importList = [];
        let pageList = containersDir.map(component => {
            // importList.push(`import ${component.name} from './${component.name}';`)
        //        return `/**${component.pageConfig.menuName}      ${component.pageConfig.name} **/\n    ${component.name}: {
        //    name: '${component.pageConfig.menuName}',
        //    path: '${component.pageConfig.componentName}',
        //    component: ${component.name} \n    }`
            return `/**${component.pageConfig.menuName}      ${component.pageConfig.name} **/\n    ${component.name}: {
        name: '${component.pageConfig.menuName}',
        path: '/${component.pageConfig.componentName}',
        component: () => import('./${component.name}').then(x => x.default) \n    }`
        });
        const conPath = path.join(global.config.containersPath, "index.ts")
        let conStr = fs.readFileSync(conPath).toString();
        conStr = conStr.replace(/(\/.*WTM.*\/)(\D*)(\/.*WTM.*\/)/, '/**WTM**/ \n    '
            + pageList.join(",\n    ") +
            '\n    /**WTM**/')
        // conStr = conStr.replace(/(\/.*import.*\/)(\D*)(\/.*import.*\/)/,"/**import**/ \n"+importList.join("\n")+"\n/**import**/").replace(/(\/.*WTM.*\/)(\D*)(\/.*WTM.*\/)/, '/**WTM**/ \n    '
        //     + pageList.join(",\n    ") +
        //     '\n    /**WTM**/')
        fs.writeFileSync(conPath, conStr);
    }

    static demo(){
        console.log("TCL: demo -> readJSON", this.readJSON(global.config.subMenuPath))
    }

}

module.exports = Tool;

// setTimeout(()=>{
//     Tool.demo();
// }, 5000)
