const res = require("../../model/res");
const tool = require("../../utils/tool");
const log = require('../../../utils/log');
const fs = require('fs-extra');

module.exports = async (ctx, next)=>{
    const component = ctx.request.body;

    let routers = tool.readJSON(global.config.subMenuPath);
    routers.subMenu = subMenu;
    fs.writeJsonSync(global.config.subMenuPath, routers, { spaces: 4 });
    log.success("updateSubMenu ");

    res.success(ctx, true);
};
