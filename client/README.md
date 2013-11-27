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
