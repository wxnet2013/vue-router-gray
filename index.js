module.exports = vueRouterGray;
function vueRouterGray(router, options) {
  if (!router) return;
  options = options || {
    check: function(params) { return Promise.resolve(false); },
    apiGray: function() {},
  };
  var fromKey = 'from';
  var fromUrl = '';
  if (options.pid) {
    fromKey = 'from_' + options.pid;
  }
  if (location.href.indexOf('index.gray.html') > -1) {
    fromUrl = localStorage.getItem(fromKey);
    if (!fromUrl) {
      return;
    }
    try {
      window.history.replaceState(
        null,
        null,
        decodeURIComponent(fromUrl)
      );
    } catch (e) {
      console.log(e);
    }
    return;
  }

  router.beforeEach(gray);

  function gray() {
    var to = null;
    var from = null;
    var next = null;
    var needNext = (arguments.length === 3);
    // vue-router 1.x
    if (arguments.length === 1 && arguments[0].next) {
      to = arguments[0].to;
      from = arguments[0].from;
      next = arguments[0].next;
    }
    // vue-router 2.x
    if (arguments.length === 3) {
      to = arguments[0];
      from = arguments[1];
      next = arguments[2];
    }
    try {
      return options.check({
        protocol: encodeURIComponent(location.protocol),
        host: encodeURIComponent(location.host),
        path: encodeURIComponent(location.pathname),
        search: encodeURIComponent(location.search),
        hash: encodeURIComponent(location.hash),
        href: encodeURIComponent(location.href),
        uid: options.uid,
      }).then(function(v) {
        if (v) {
          options.apiGray(!!v.isApiGray);
          if (v.isPageGray && v.nextUrl) {
            // 记录当前页面地址
            localStorage.setItem(fromKey, encodeURIComponent(location.href));
            location.href = v.nextUrl;
          }
        }
        return needNext ? next() : true;
      }).catch(function(e) {
        console.log('api error');
        console.log(e);
        return needNext ? next() : true;
      });
    } catch(e) {
      console.log('error');
      console.log(e);
      return next();
    }
  };
};
