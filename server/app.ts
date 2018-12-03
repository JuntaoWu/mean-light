import * as createError from 'http-errors';
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as cors from 'cors';
import * as fs from 'fs';
import * as formidable  from 'formidable';

import indexRouter from './routes';
import passport from './config/passport';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'jade');

// parse body params and attache them to req.body
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

app.use(cors());

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, '../client')));

app.use(express.static(path.join(__dirname, '../../public'), {
    setHeaders: function (res, p) {
        if (p.indexOf('sw.js') !== -1 || p.indexOf('manifest.json') !== -1 || p.indexOf('index.html') !== -1) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}), cors());
app.use(express.static(path.join(__dirname, '../../public/sw.js'), {
    etag: false
}), cors());



app.use(passport.initialize());
app.use(passport.session());

app.post("/api/upload", (req, res, next) => {
    var form = new formidable.IncomingForm();
    //设置文件上传存放地址
    const uploadDir = path.join(__dirname, '../client/uploads');
    fs.exists(uploadDir, async (exists) => {
        if (!exists) {
            await fs.mkdir(uploadDir, (err) => {
                if(err){
                    throw "上传文件夹不存在";
                }
            })
        }
        form.uploadDir = uploadDir;
        form.keepExtensions = true;//保存扩展名
        form.maxFieldsSize = 20 * 1024 * 1024;//上传文件的最大大小
        //执行里面的回调函数的时候，表单已经全部接收完毕了。
        form.parse(req, (err, fields, files) => {
            const file = files.files;
            //旧的路径
            var oldpath = file.path;
            //新的路径
            var newpath = uploadDir + "/" + file.name;
            // 改名
            fs.rename(oldpath, newpath, (err) => {
                if(err){
                    return res.json({
                        ResultCode: 3,
                        Message: 'fails',
                        path: oldpath,
                    });
                }
                else {
                    return res.json({
                        ResultCode: 0,
                        Message: 'ok',
                        path: newpath,
                    });
                }
            });
            // return res.json({
            //     ResultCode: 1,
            //     Message: 'suc',
            //     State: '',
            // });
        });
    })    
})

app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

export default app;