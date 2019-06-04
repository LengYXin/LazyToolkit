const res = require("../../model/res");

module.exports = async (ctx, next)=>{

    const data = {
        contextRoot: global.config.root_path,
        // componentName: this.componentCreate.componentName,
        containersPath: global.config.containers_path,
        subMenuPath: global.config.subMenuPath,
        subMenu: global.config.subMenuConfig,
        templates: global.config.templates,
        wtmfrontConfig: global.config.wtmfrontConfig
    };

    res.success(ctx, data);
};
