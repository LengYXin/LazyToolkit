const router = require('koa-router')();

router.prefix('/server')

/**
 * 初始化项目信息
 */
router.get("/init", require("../src/server/init"));
router.get("/containers", require("../src/server/containers"));
router.get("/api-docs", require("../src/server/api_docs"));

router.post("/create", require("../src/server/create"));


module.exports = router
