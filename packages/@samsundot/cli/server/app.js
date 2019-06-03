const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('../utils/log');
const fs = require('fs-extra')
const path = require('path');
const rootPath = process.cwd();
const http = require('http');
const index = require('./routes/index')

class App{
    constructor(port){
        this.wtmfront_config = "wtmfront.config.js";
        this.req_num = 0;
        this.port = port || 8765;
        console.log("@@@@", rootPath)
        this.componentCreate = new componentCreate(rootPath, this.wtmfront_config);
    }

    run(){
        //环境检查
        // if(!this.safety_check()){
        //     return;
        // }
        
        // error handler
        onerror(app)

        // middlewares
        app.use(bodyparser({
            enableTypes:['json', 'form', 'text']
        }))
        
        app.use(json())
        
        app.use(require('koa-static')(path.join(rootPath, "wtmfront", "swagger", "dist")))
        
        app.use(async (ctx, next)=>{
            ctx.set("Access-Control-Allow-Credentials", true);
            const start = Date.now();
            ctx.request.body.request_start_ts = start;
            this.req_num++;
        
            await next();
            const ms = Date.now() - start;
            logger.success(`${this.req_num} ${ctx.method} ${ctx.url} ${ctx.status} ${(ctx.body && ctx.body.msg) || ""} - ${ms} ms`);
        })
        
        // routes
        app.use(index.routes(), index.allowedMethods())
        
        // error-handling
        app.on('error', (err, ctx) => {
        //   console.error('server error', err, ctx)
            logger.error('server error', err, ctx)
        });

        const server = http.createServer(app.callback());
        
        console.log("@@@@@", this.port)
        server.listen(this.port);
        server.on('error', this.on_error);
        server.on('listening', ()=>{
            logger.success('模板服务已启动 http://localhost:' + this.port);
        });
  
    }

    safety_check(){
        if (fs.pathExistsSync(path.join(rootPath, 'package.json'))) {
            const wtm_config_path = path.join(rootPath, this.wtmfront_config);
            if (fs.pathExistsSync(wtm_config_path)) {
                return true;
            } else {
                logger.error(`找不到 配置文件~ file:${this.wtmfront_config} `);
                return false;
            }
        } else {
            logger.error(`找不到项目~`);
            return false;
        }
    }

    on_error(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
      
        var bind = typeof this.port === 'string'
            ? 'Pipe ' + this.port
            : 'Port ' + this.port;
      
        // handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
          default:
            throw error;
        }
    }
}

module.exports = App;

new App(1111).run();