const http = require('http');
const fs = require('fs');
const path = require('path');
const koaStatic = require('koa-static');
const koaBody = require('koa-body'); //文件保存库
const Router = require('koa-router');
const Koa = require('koa');
let app = new Koa();
var router = new Router();


const port = process.env.PORT || '3000';
const uploadHost = `http://localhost:${port}/uploads/`;

const middleware1 = async(ctx, next) => {
    console.log(1);
    await next();
    console.log(6);
}

app.use(koaBody({
    formidable: {
        //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
        uploadDir: path.resolve(__dirname, '../../uploads')
    },
    multipart: true // 开启文件上传，默认是关闭
}));
//开启静态文件访问
app.use(koaStatic(
    path.resolve(__dirname, './static')
));
//文件二次处理，修改名称
router.post('/upload', (ctx, next) => {
    var file = ctx.request.files ? ctx.request.files.f1 : null; //得道文件对象
    let result = [];
    if (!file || file.size === 0) {
        ctx.body = {
            msg: "无文件"
        };
        return;
    } else if (file && file.length > 0) {
        file.forEach(item => {
            result.push(changeName(item));
        });
    } else {
        result.push(changeName(file));
    }

    //以 json 形式输出上传文件地址 
    ctx.body = { fileUrl: result };

});

function changeName(file) {
    var path = file.path;
    var fname = file.name; //原文件名称
    var nextPath = path + fname;
    //得到扩展名
    var extArr = fname.split('.');
    var ext = extArr[extArr.length - 1];
    var nextPath = path + '.' + ext;
    //重命名文件
    fs.renameSync(path, nextPath);
    return nextPath
}
// router.get("/index",(ctx,next)=>{
// })
app
    .use(router.routes())
    .use(router.allowedMethods());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx);
});
//  app.listen(port)
/**
 * http server
 */
var server = http.createServer(app.callback());
server.listen(port);