const _code = require("./code");

class Res{
    constructor(code, message, data){
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

const response = (ctx, result)=>{
    // ctx.status = result.code;
    ctx.body = result;
}

module.exports = {
    success: (ctx, data, code)=>{
        code = code || _code.success;
        const result = new Res(code, "", data);
        response(ctx, result);
    },
    error: (ctx, message, code)=>{
        code = code || _code.error;
        const result = new Res(code, message, false)
        response(ctx, result);

    },
    not_found:(ctx)=>{
        code = code || _code.not_found;
        const result = new Res(code, message)
        response(ctx, result);
    }
}