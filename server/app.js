/**
 * Serveur domotique par Jérôme SAYNES 2013-10-23
 */

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var sys = require('sys');
var app = express();

var domo = require(__dirname + '/domotique.js');


app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/:id/data-last.json', function (req, res) {
    domo.getData(req.params.id, true, function (time, val) {
        return res.send(JSON.stringify({time: time, val: val}));
    });
});

app.get('/:id/datas.json', function (req, res) {
    domo.datas(req.params.id, req.query, function(valeurs) {
        return res.send(JSON.stringify(valeurs));
    });
});

app.get('/:id/data-live.json', function (req, res) {
    domo.getData(req.params.id, false, function (time, val) {
        return res.send(JSON.stringify({time: time, val: val}));
    });
});




app.get('/:id/sensor.json', function(req,res) {
    domo.sensor(req.params.id, function(c) {
        return res.send(JSON.stringify(c));
    });
});
app.post('/:id/sensor.json', function(req,res) {
    domo.setSensor(req.params.id, req.body, function(c) {
        return res.send(JSON.stringify(c));
    });
});
app.delete('/:id/sensor.json', function(req,res) {
    domo.delSensor(req.params.id, function(c) {
        return res.send(JSON.stringify(c));
    });
});




app.get('/sensors.json', function(req,res) {
    domo.sensors(function(c) {
        return res.send(JSON.stringify(c));
    });
});
app.post('/sensors.json', function(req,res) {
    domo.addSensor(req.body, function(c) {
        return res.send(JSON.stringify(c));
    });
});


app.get('/sql.json', function(req,res) {
    domo.sql(req.query.q, function(c) {
        return res.send(JSON.stringify(c));
    });
});

app.get('/sql.html', function(req,res) {
    domo.sql(req.query.q, function(rows) {
        if (typeof rows==="string") {
            return res.send(rows);
        }
        var i, html, head=false;
        html=req.query.q+'<table border=1 cellspacing=0>';
        rows.forEach(function(row) {
            if (!head) {
                html=html+'<thead><tr>';
                for(i in row) {
                    html=html+'<td>'+i+'</td>';
                }
                html=html+'</tr></thead>';
                head=true;
            }
            html=html+'<tr>';
            for(i in row) {
                html=html+'<td>'+row[i]+'</td>';
            }
            html=html+'</tr>';
        });
        html=html+'</table>'+rows.length+' lignes';
        return res.send(html);
    });
});


app.get('/:id/camera-alarm.json', function (req, res) {
    domo.log('Camera Alarm');
    var fdate = domo.dateFileFormat(new Date());
    domo.cameraAlarm(req.params.id, function(json) {
        return res.send(JSON.stringify(json));
    });
});


app.get('/:id/snapshots.json', function (req, res) {
    domo.snapshots(req.params.id, function (snap) {
        return res.send(JSON.stringify(snap));
    });
});


app.get('/camera-snapshot/:id.jpg', function(req, res) {
    cam.snapshot(__dirname + '/public/snapshot.jpg', function () {
        fs.readFile(__dirname + '/public/snapshot.jpg', function (err, data) {
            if (err) {
                throw err;
            }
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data);
        });

    });
});


// http://192.168.1.112/1/snapshot-2013-10-28_14-15-40.jpg
app.get('/:id/snapshot-:date.jpg', function(req, res) {
    domo.snapshotDate(req.params.id, req.params.date, function(json) {
        if (json) {
            fs.readFile(json.fic, function (err, data) {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data);
            });
        } else {
            res.send();
        }
    });
});


// http://192.168.1.112/1/snapshot-2013-10-28_14-15-40.json
app.get('/:id/snapshot-:date.json', function(req, res) {
    domo.snapshotDate(req.params.id, req.params.date, function(json) {
        return res.send(JSON.stringify(json));
    });
});


http.createServer(app).listen(app.get('port'), function(){
    var txt='*** Domotique server start on port ' + app.get('port');
    domo.log(txt);
/*    domo.cameraAlarm(3, function(r) {
        console.log(r);
    });
*/
});
