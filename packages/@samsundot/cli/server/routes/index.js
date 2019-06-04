const router = require('koa-router')();

router.prefix('/server')

/**
 * 初始化项目信息
 */
router.get("/init", require("../src/server/init"));
router.get("/containers", require("../src/server/containers"));
router.get("/api-docs", require("../src/server/api_docs"));

router.post("/create", require("../src/server/create"));
router.post("/update", require("../src/server/update"));
router.post("/delete", require("../src/server/delete"));
router.post("/updateSubMenu", require("../src/server/updateSubMenu"))

module.exports = router
