Domotique
=========

Raspberry Pi + nodejs + html5 + Camera IP + 1wire = Domotique


# Installation

1. Copier le dossier Domotique sur le serveur
2. Installer nodejs
3. Intaller les modules via : npm install
4. Lancer le serveur via : node app.js
5. Appeler l'IP du serveur avec votre navigateur Web préféré pour afficher le client.

Au premier lancement la BDD est créé automatiquement.

# serveur

le serveur propose une API et stocke l'historique des données.

## Quelles sont les API ?

- 1/sensor.json
- 1/data-last.json
- 1/data-live.json
- 1/datas.json
- 1/snapshot-last.jpg
- 1/snapshot-live.jpg
- 1/snapshot-2013-10-28_14-15-40.jpg
- 1/snapshots.json
- 1/video-last.avi
- 1/video-live.avi
- 1/videos.json

# Client

Le client fonctionne en local sans serveur. 
Il s'agit d'une simple page Html.
Il suffit d'ouvrir index.html dans votre navigateur.

## Comment ajouter un écran personalité ?

Si vous voulez ajoute un écran sur l'url http://IP/#/demo

Ajoutez dans le HTML
```html
<script type="text/html" id="page-demo">
  <header class="bar-title">
      <a class="button-prev navigate" href="/">Accueil</a>
      <h1 class="title">Ma page</h1>
  </header>
  <div class="content">
    Ma page de démo
  </div>
</script>        
```

Si vous voulez une intéraction avec le contenu de la page. Remplacez "Ma page de démo" par "Ma page de {{mapage}}" et ajoutez dans control.js
```javascript
demo: function() {
        app.view('demo', {mapage: "démo"});
}
```
