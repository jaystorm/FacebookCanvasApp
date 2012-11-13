module.exports = exports = function (type) {
    var ejs = require('ejs');
    var svc = type.extend("jaystormdemoapp.ServiceContext", {
        getResource: function (fileName) {
            ///<method type="GET" />
            var self = this;
            return function (success, error) {
                return self.Files.single('it.FileName == this.filePath', { filePath: fileName }, {
                    success: function (file) {
                        if (success) {
                            var result = new $data.ServiceResult(file.Content);
                            result.contentType = file.ContentType;
                            success(result)
                        }
                    },
                    error: function (error) {
                        if (success) success(new $data.EmptyServiceResult(404))
                        else this.reject();
                    }
                });
            }
        },
        getPage: function () {
            var self = this;
            var filePath = '/fbindex.html';

            var req = this.executionContext.request;
            var json = {};
            if (req.body && req.body.signed_request) {
                var encoded_data = req.body.signed_request.split('.')[1];
                json = JSON.parse(new Buffer(encoded_data, 'base64').toString('utf8'));
            }

            return function (success, error) {
                var resourceFn = self.getResource(filePath)
                resourceFn().then(function (file) {
                    var htmlText = ejs.render(file.Content, {
                        login: !json.oauth_token,
                        clientId: '471967662848482',
                        appName: 'jaystormdemoapp',
                        serviceName: 'jaystormdemoapp',
                        scope: 'read_friendlists,friends_birthday',
                        stormAppId: 'd96de3eb-f446-4ec5-acbf-313590b4b9fc',
                        files: req.fullRoute.substring(0, req.fullRoute.lastIndexOf('/'))
                    });
                    success(new $data.HtmlResult(htmlText));
                }).fail(function (e) { success(new $data.EmptyServiceResult(404)); });
            }
        }
    });

    svc.annotateFromVSDoc();
    return svc;
};