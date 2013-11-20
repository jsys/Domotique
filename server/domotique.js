var fs = require('fs');
//var sys = require('sys');
var sqlite3 = require('sqlite3');
var exec = require('child_process').exec;
var http = require('http');
var path = require('path');

var db = new sqlite3.Database(path.join(__dirname, 'domotique.db'));

var moment = require('moment');
moment.lang('fr');

exports.log = function (txt) {
    //console.log(txt);
    fs.appendFile(__dirname + '/domotique.log', exports.dateSqlFormat(new Date()) + ' ' + txt + "\n");
}


exports.temperature1wire=function(uid, callback) {
    var fic='/mnt/1wire/uncached/'+uid+'/temperature';
    var time = Date.now();
    if (fs.existsSync(fic)) {
        var buffer=fs.readFileSync(fic);
        var temp  = parseFloat(buffer.toString().trim());
        temp = Math.round(temp * 10) / 10;
        
        callback(time,temp);
    } else {
        callback(false,false);
    }  
}


exports.temperatureCM=function(callback) {
    var time = Date.now();
    var child = exec("/opt/vc/bin/vcgencmd measure_temp", function (error, stdout, stderr) {
        if (error == null) {
            var e=stdout.split('=');
            e=e[1].split("'");
            var temp=parseFloat(e[0]);
            
            callback(time,temp);
        } else {
            callback(false,false);
        }
    });
};

/*
Sauve une donnée dans la BDD
*/
exports.setData=function(time,cap_id,val, callback) {
    db.get("INSERT INTO valeurs VALUES ('"+time+"', '"+cap_id+"', '"+val+"')",function(result){
        exports.log(JSON.stringify({time:time,cap_id:cap_id,val:val}));
        if (typeof callback==='function') {
            callback(time,cap_id,val);
        }
    });
};

/*
Renvoi la valeur d'un capteur
*/
exports.getData=function(cap_id, cache, callback) {
    db.each("SELECT * FROM capteurs WHERE cap_id='"+cap_id+"'",function(error, row){
        if (error == null) {
            if (cache) { // Valeur en BDD si on utilise le cache
                db.each("SELECT * FROM valeurs WHERE cap_id='"+cap_id+"' ORDER BY time DESC LIMIT 1", function(err,row) {
                    callback(row.time,row.val);
                });
            } else {
                if (row.type==='temperature'&&row.techno==='1wire') {
                    var data=JSON.parse(row.data);
                    if (typeof data.mac!=='undefined') {
                        exports.temperature1wire(data.mac, function(time,temp) {
                            callback(time,temp);  
                        });
                    };
                } else if (row.type==='temperature'&&row.techno==='CM') {
                    exports.temperatureCM(function(time,temp) {
                        callback(time,temp);  
                    });
                };
            }
        };
    });
};

/*
Relève la valeur d'un capteur et sauve sa valeur en BDD
*/
exports.getSetData=function(cap_id,callback) {
    exports.getData(cap_id, false, function(time,val) {
        if (time!==false) {
            exports.setData(time,cap_id,val,callback);
        };
    });
};


/*
Relève la valeur d'un capteur et sauve sa valeur en BDD
*/
exports.getSetSensors=function(callbackeach) {
    db.each("SELECT * FROM capteurs", function(error, row){
        if (error == null) {
            exports.getSetData(row.cap_id, callbackeach);
        };
    });
};


exports.datas=function(cap_id, params, callback) {
    var res=[], q;
    console.log(params);

    var WHERE=" WHERE cap_id='"+cap_id+"'";
    if (typeof params.from !== "undefined" && typeof params.to !== "undefined") {
        WHERE = WHERE + " AND time>='"+params.from+"' AND time<='"+params.to+"'";
    }

    var LIMIT =" LIMIT 48";
    if (typeof params.max !== "undefined") {
        LIMIT=" LIMIT "+params.max;
    }

    var SELECT="SELECT time,val",
        GROUP="";
    if (params.group === "hour") {
        SELECT="SELECT time, ROUND(AVG(val)*100)/100 AS val";
        GROUP=" GROUP BY strftime('%Y%m%d%H', time/1000,'unixepoch')";
    } else if (params.group === "day") {
        SELECT="SELECT time, ROUND(AVG(val)*100)/100 AS val";
        GROUP=" GROUP BY date(time/1000,'unixepoch')";
    } else if (params.group === "month") {
        SELECT="SELECT time, ROUND(AVG(val)*100)/100 AS val";
        GROUP=" GROUP BY strftime('%Y%m', time/1000,'unixepoch')";
    } else if (params.group === "year") {
        SELECT="SELECT time, ROUND(AVG(val)*100)/100 AS val";
        GROUP=" GROUP BY strftime('%Y', time/1000,'unixepoch')";
    }

    q=SELECT + " FROM valeurs "+ WHERE + GROUP + " ORDER BY time DESC" + LIMIT;
    console.log(q);

    db.each(q,
    function(err,row) {
      res.push(row);
    }, 
    function(err,rows) {
        callback(res);
    });
};


exports.sensors=function(callback) {
    var capteurs=[];
    db.each("SELECT cap_id AS id,nom,techno,type,data,(SELECT time FROM valeurs V WHERE V.cap_id=C.cap_id ORDER BY time DESC LIMIT 1) AS time,(SELECT val FROM valeurs V WHERE V.cap_id=C.cap_id ORDER BY time DESC LIMIT 1) AS val FROM capteurs C", function(err,row) {
        row.delta=moment(row.time).fromNow();
        //if (row.type==='temperature') row.typeTemperature=true;
        //if (row.type==='foscam') row.typeFoscam=true;
        capteurs.push(row);
    }, function(err, rows) {
        callback(capteurs);
    });
}


exports.sensor=function(cap_id, callback) {
    db.each("SELECT cap_id AS id,nom,techno,type,data,(SELECT time FROM valeurs V WHERE V.cap_id=C.cap_id ORDER BY time DESC LIMIT 1) AS time,(SELECT val FROM valeurs V WHERE V.cap_id=C.cap_id ORDER BY time DESC LIMIT 1) AS val FROM capteurs C WHERE cap_id="+cap_id, function(err,row) {
        row.delta=moment(row.time).fromNow();
        callback(row);
    }, function(err, rows) {

    });
}



exports.dateFileFormat=function(d) {
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate()) +'_'
      + pad(d.getUTCHours())+'-'
      + pad(d.getUTCMinutes())+'-'
      + pad(d.getUTCSeconds());
}

exports.dateSqlFormat=function(d) {
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate()) +' '
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds());
}

exports.dateStrFormat=function(d) {
  function pad(n){return n<10 ? '0'+n : n}
  return d.getUTCDate()+'/'
      + pad(d.getUTCMonth()+1)+'/'
      + pad(d.getUTCFullYear()) +'_'
      + pad(d.getUTCHours())+'-'
      + pad(d.getUTCMinutes())+'-'
      + pad(d.getUTCSeconds());
}

/*
domo.saveCameraIP('video.avi', '192.168.1.113','admin','password', 2, function(size,second) {
    console.log('recording '+size+' bytes in '+second+' seconds');
}, function(error) {
    console.log(error);
});
*/
exports.saveCameraIP=function(fileOut, host, user, pass, maxSecond, callback, callbackError) {
    var file = fs.createWriteStream(fileOut);
    var date = null;
    var buffer, second;
    var req = http.get({host: host, port: 80, path: '/video.cgi?user='+user+'&pwd='+pass}, function(res) {
        res.setEncoding('binary');
        res.on('data', function(chunk) {
            buffer = file.write(chunk);
            if(buffer == false) { 
                res.pause();
            }
            if (date == null) {
                date = new Date();
            };
            second = (new Date()-date)/1000;
            if (second > maxSecond) {
                req.abort();
                if (typeof callback==='function') {
                    callback(file.bytesWritten, second);
                }
            } 
        });
        res.on('end', function() {
            if (res.statusCode!==200) {
                if (typeof callbackError==='function') {
                    callbackError('Status Code: ' + res.statusCode);
                }
            }
        });
        file.on('drain', function() {
            res.resume();
        });
    });
    req.on('error', function(error) {
        if (typeof callbackError==='function') {
            callbackError(error);
        }
    });

};


/*
Renvoi la liste des snapshot du capteur
 */
exports.snapshots=function(cap_id, callback) {
    var res=[],
        p=path.join(__dirname, 'data','capteur', cap_id);
    fs.readdir(p,function(error,fic) {
        var f,e;
        for( var i in fic){
            f=fic[i];
            if (f.substr(0,8)==="snapshot") {
                res.push({url: cap_id + '/snapshot-' + f.substr(9,19) + '.jpg', date: f.substr(9,10), time: f.substr(20,8).replace('-',':')});
            }
        }
        callback(res);
    });
}

/*
Renvoi le fichier du snapshot
 */
exports.snapshotDate=function(cap_id, date, callback) {
    var p=path.join(__dirname, 'data','capteur', cap_id);
        fic=path.join(p, 'snapshot_' + date + '.jpg');
    if (fs.exists(fic, function(ok) {
        if (ok) {
            callback(fic);
        }
    }));
};

exports.sql=function(q, callback) {
    res=[];
    console.log(q);
    db.each(q, function(err,row) {
        if (err == null) {
            //console.log(row);
            res.push(row);
        }
    }, function(err, rows) {
        if (err == null) {
            callback(res);
        } else {
            callback("ERREUR");
        }
    });

};