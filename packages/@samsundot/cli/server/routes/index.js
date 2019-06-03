const router = require('koa-router')();

router.prefix('/server')

router.get('/demo', (ctx, next)=>{
    ctx.body = {
        code: 200,
        data: true,
        message: `create 成功`
    };
});
// router.post("/register", require("../src/user/register"));
// router.post("/friends", require("../src/user/friends"));
// router.post("/msg_list", require("../src/user/msg_list"));

module.exports = router
