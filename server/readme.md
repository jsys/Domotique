# serveur

le serveur propose une API et stocke l'historique des données.

## Quelles sont les API ?

- http://IPSERVEUR/sensors.json
- http://IPSERVEUR/1/sensor.json
- http://IPSERVEUR/1/data-last.json
- http://IPSERVEUR/1/data-live.json
- http://IPSERVEUR/1/datas.json
- http://IPSERVEUR/1/snapshot-last.jpg
- http://IPSERVEUR/1/snapshot-live.jpg
- http://IPSERVEUR/1/snapshot-2013-10-28_14-15-40.jpg
- http://IPSERVEUR/1/snapshots.json
- http://IPSERVEUR/1/video-last.avi
- http://IPSERVEUR/1/video-live.avi
- http://IPSERVEUR/1/videos.json

## Comment débugger ?

Il est possible de faire des requetes sur les tables et d'afficher le résultat :

    http://IPSERVEUR/sql.html?q=SELECT%20*%20FROM%20capteurs

    http://IPSERVEUR/sql.html?q=SELECT%20*%20FROM%20valeurs