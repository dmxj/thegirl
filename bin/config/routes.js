var conf = require('./config');
var path = require('path');
var routerTest = require(path.join(conf.router_dir, 'test'));
var routerIndex = require(path.join(conf.router_dir, 'index'));
var routerAdmin =  require(path.join(conf.router_dir, 'routerAdmin'));

module.exports = function(app)
{
    app.use('/', routerIndex);
    app.use('/admin', routerAdmin);
    app.use('/test', routerTest);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            return res.status(err.status || 500).render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        return res.status(err.status || 500).render('error', {
            message: err.message,
            error: {}
        });
    });
}