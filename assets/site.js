// Wiki FruitBorne : menu telephone, onglets de la boite d'infos, recherche instantanee (index charge en .js : marche aussi en local).
(function () {
  var bouton = document.querySelector('.bouton-menu');
  var nav = document.querySelector('.nav');
  if (bouton && nav) {
    bouton.addEventListener('click', function () { nav.classList.toggle('ouverte'); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('ouverte') && !nav.contains(e.target) && e.target !== bouton) nav.classList.remove('ouverte');
    });
  }

  document.querySelectorAll('.infobox .onglets').forEach(function (barre) {
    var boutons = barre.querySelectorAll('button');
    boutons.forEach(function (b) {
      b.addEventListener('click', function () {
        boutons.forEach(function (x) { x.classList.toggle('actif', x === b); });
        barre.parentNode.querySelectorAll('.panneau').forEach(function (p) { p.hidden = p.getAttribute('data-onglet') !== b.getAttribute('data-onglet'); });
      });
    });
  });

  var champ = document.getElementById('recherche');
  var boite = document.getElementById('resultats');
  var index = window.INDEX_RECHERCHE || [];
  var racine = document.documentElement.getAttribute('data-racine') || '';
  if (!champ || !boite) return;

  function normaliser(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  index.forEach(function (e) { e._n = normaliser(e.t + ' ' + (e.m || '')); e._t = normaliser(e.t); });
  var actif = -1;

  function afficher() {
    var q = normaliser(champ.value.trim());
    boite.innerHTML = '';
    actif = -1;
    if (!q) { boite.classList.remove('ouvert'); return; }
    var mots = q.split(/\s+/);
    var trouves = index.filter(function (e) { return mots.every(function (m) { return e._n.indexOf(m) >= 0; }); });
    trouves.sort(function (a, b) {
      var pa = a._t.indexOf(q) === 0 ? 0 : (a._t.indexOf(q) > 0 ? 1 : 2);
      var pb = b._t.indexOf(q) === 0 ? 0 : (b._t.indexOf(q) > 0 ? 1 : 2);
      return pa - pb || a.t.localeCompare(b.t);
    });
    trouves.slice(0, 12).forEach(function (e) {
      var a = document.createElement('a');
      a.href = racine + e.u;
      if (e.i) { var im = document.createElement('img'); im.src = racine + e.i; im.alt = ''; im.loading = 'lazy'; a.appendChild(im); }
      var d = document.createElement('div');
      d.textContent = e.t;
      if (e.c) { var s = document.createElement('small'); s.textContent = e.c; d.appendChild(s); }
      a.appendChild(d);
      boite.appendChild(a);
    });
    if (!trouves.length) { var v = document.createElement('div'); v.className = 'vide'; v.textContent = champ.getAttribute('data-vide'); boite.appendChild(v); }
    boite.classList.add('ouvert');
  }
  champ.addEventListener('input', afficher);
  champ.addEventListener('focus', afficher);
  champ.addEventListener('keydown', function (e) {
    var liens = boite.querySelectorAll('a');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      actif = Math.max(0, Math.min(liens.length - 1, actif + (e.key === 'ArrowDown' ? 1 : -1)));
      liens.forEach(function (l, i) { l.classList.toggle('actif', i === actif); });
    } else if (e.key === 'Enter') {
      var cible = liens[actif >= 0 ? actif : 0];
      if (cible) window.location.href = cible.href;
    } else if (e.key === 'Escape') { boite.classList.remove('ouvert'); champ.blur(); }
  });
  document.addEventListener('click', function (e) { if (!boite.contains(e.target) && e.target !== champ) boite.classList.remove('ouvert'); });
})();
