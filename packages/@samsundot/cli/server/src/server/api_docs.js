module.exports = async (ctx, next)=>{

    const data = require("../../model/swaggerDoc.json");

    ctx.body = data;
};
