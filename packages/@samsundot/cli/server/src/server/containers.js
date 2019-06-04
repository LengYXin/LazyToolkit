const res = require("../../model/res");
const tool = require("../../utils/tool");

module.exports = async (ctx, next)=>{

    const data = {
        containers: tool.getContainersDir(),
        resources: global.config.subMenuConfig
    };

    res.success(ctx, data);
};
