var control={
    root: function() {
        app.view('root', {});
        // Chargement de la liste des capteurs
        $.getJSON(app.SERVER+'sensors.json', function(data) {
            if (data==='installok') {
                $('.content').append('Installation de la base de donnée réussi. Vous pouvez ajouter vos capteurs.');
            } else if (data==='installerr') {
                    $('.content').append("Erreur : impossible d'installer la base de donnée. Supprimez le fichier domotique.db pour rééssayer.");
            } else {
                $.each(data, function(k, v) {
                    if (v.type==='temperature') {
                        v.url='temperature/'+ v.id;
                        app.template('.content ul', 'root-temperature', v);
                    }
                    if (v.type==='foscam') {
                        v.url='foscam/'+ v.id;
                        app.template('.content ul', 'root-foscam', v);
                    }
                });
            }

        }).fail(function(err) {
                console.log(err);
                $('.content').append('Erreur réseau. Impossible de récupérer la liste des capteurs depuis le serveur.<br /><br />Chargez cette page depuis le serveur en tapant <strong>http://a.b.c.d</strong> ou a.b.c.d est l\'adresse du serveur.<br />Par exemple <a href="http://127.0.0.1">http://127.0.0.1</a> si le serveur tourne sur cet ordinateur.');
            });

    },


    foscam: function(id) {
        app.view('foscam', {});
        $.getJSON(this.SERVER + id + '/snapshots.json', function(data) {
            $.each(data, function(k, v) {
                v.id=id;
                app.template('.content ul', 'foscam-thumb', v);
            });
        });
    },


    snapshot: function(id, date) {
        app.view('snapshot', {id:id, date:date});
        console.log(id, date);
    },


    capteuradd: function() {
        app.view('capteuradd', {});
        $('#capteuradd-ajouter').click(function(e) {
            e.preventDefault();
            $.ajax({type: 'POST', url: '/sensors.json', data: $('#capteuradd-form').serialize(), success: function(json) {
                if (json.code===200) {
                    app.navigate('capteuredit/'+json.id);
                }
            }, dataType: 'json'});
        });
    },


    capteuredit: function(id) {
        $.getJSON(id+'/sensor.json', function (sensor) {
            app.view('capteuredit', sensor);
            $('#capteuredit-sauve').click(function(e) {
                e.preventDefault();
                $.ajax({type: 'POST', url: id+'/sensor.json', data: $('#capteuredit-form').serialize(), success: function(json) {
                    if (json.code===200) {
                        app.navigate('');
                    }
                }, dataType: 'json'});
            });
        });
    },


    temperature: function(id) {
        $.getJSON(id+'/sensor.json', function (sensor) {

            app.view('temperature', sensor);

            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'chart-temperature',
                    defaultSeriesType: 'spline'
                },
                title: {
                    text: sensor.nom
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: false
                    }
                },
                xAxis: {
                    type: 'datetime',
                    gridLineWidth: 1,
                    tickWidth: 0,
                    maxZoom: 20 * 1000
                },
                yAxis: {
                    minPadding: 0.2,
                    maxPadding: 0.2,
                    title: {
                        text: 'Temperature \u00B0C',
                        margin: 15
                    }
                },
                tooltip: {

                    formatter: function() {
                       // console.log(this);
                        return moment(this.x).lang('fr').calendar() + ' : ' + this.y + '°C';
                    }
                }
            });

            while (chart.series.length > 0) {
                chart.series[0].remove(true);
            }

            function addSerie(datefrom, dateto, group, delta) {
                $.getJSON(id+'/datas.json?from='+(datefrom-delta)+'&to='+(dateto-delta)+'&group='+group+'&max=365', function (data) {
                    var series = {
                        id: 'series',
                        name: moment(datefrom-delta).lang('fr').calendar() + ' - ' + moment(dateto-delta).lang('fr').calendar(),
                        data: []
                    }, i = 0;
                    data.reverse();
                    while (data[i]) {
                        series.data.push([data[i].time+delta, data[i].val * 1]);
                        i++;
                    }
                    chart.addSeries(series);
                });
            }

            function graphVue(vue) {
                while (chart.series.length > 0) {
                    chart.series[0].remove(true);
                }

                var d=new Date()* 1,
                    j = 1000*3600*24;

                if (vue==="jour") {
                    chart.xAxis[0].options.tickInterval = 3600*1000; // 1 heure
                    addSerie(d-j*1, d, '', 0);
                    addSerie(d-j*12, d, '', j*1);
                } else if (vue==="semaine") {
                    chart.xAxis[0].options.tickInterval = j; // 1 jour
                    addSerie(d-j*7, d, 'hour', 0);
                    addSerie(d-j*7, d, 'hour', j*7);
                } else if (vue==="mois") {
                    chart.xAxis[0].options.tickInterval = j; // 1 jour
                    addSerie(d-j*31, d, 'day', 0);
                    addSerie(d-j*31, d, 'day', j*31);
                } else if (vue==="annee") {
                    chart.xAxis[0].options.tickInterval = j; // 1 jour
                    addSerie(d-j*365, d, 'month', 0);
                }
            }

            graphVue('jour');

            $('.temp-group').on('click', function(e) {
                var vue=$(this).data('vue');
                graphVue(vue);
                e.preventDefault();
            });


        });
    },


    about: function() {
        app.view('about', {SERVER: app.SERVER});
    }

};
