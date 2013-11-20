/*
Fichier appelé toutes les 5 minutes via une tache cron
 */

var domo=require(__dirname+'/domotique.js');

domo.getSetSensors(function(time,cap_id,val) {
    console.log(time,cap_id,val);
});