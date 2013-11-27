var app = {
    SERVER: 'AUTO',
    ctrl:null,

    init: function(server, control) {
        if (server==='AUTOIP') {
            app.SERVER=window.location.origin+'/';
        } else {
            app.SERVER=server;
        }
        this.ctrl=control;
        app.navigate();
    },

    append: function(content, tplid, data, clear) {
        var tpl = $('#'+tplid).html();
        var html = Mustache.render(tpl, data);
        if (clear===true) {
            $(content).html('');
        }
        $(content).append(html);
        $(content + ' a.navigate').off('click');
        $(content + ' a.navigate').on('click', function(e) {
            app.navigate($(this).attr('href'));
            e.preventDefault();
        });
    },

    view: function(page, data) {
        this.append('body', 'page-'+page, data, true);
    },

    navigate: function(path) {
        var p;
        if (typeof path === 'undefined') {
            p=window.location.hash;
        } else {
            p=path;
        }
        p= p.split('/');
        if (p[0]==='#') {
            p.shift();
        }
        console.log(p);
        if (p[0] !=="") {
            // Si un controleur existe on appelle le controleur
            if (typeof this.ctrl[p[0]]==='function') {
                this.ctrl[p[0]](p[1],p[2], p[3]);
            } else {
                if ($('#page-'+p[0]).length>0) {
                    app.view(p[0], {});
                } else {
                    app.view('notfound', {});
                }
            }
            if (typeof path!=='undefined' && window.location.protocol !== 'file:') {
                history.replaceState(null,null, '/#/'+path);
            }
        } else {
            this.ctrl.root();
            if (window.location.protocol !== 'file:') {
                history.replaceState(null,null, '/');
            }
        }
    }
};
