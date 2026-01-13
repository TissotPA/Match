# 🏀 Basketball Match Stats - Contexte Projet

## 📋 Vue d'ensemble

Application web de suivi statistique en temps réel pour matchs de basketball féminin.

**URL de production :** https://tissotpa.github.io/Match/  
**Repository :** https://github.com/TissotPA/Match

---

## 🛠️ Stack Technique

- **Frontend :** HTML5, CSS3, JavaScript vanilla (ES6)
- **Stockage :** localStorage (persistance), sessionStorage (page récap)
- **Hébergement :** GitHub Pages
- **Design :** Mobile-first, responsive, thème rouge (#DC143C)

---

## 📁 Structure des Fichiers

```
Match/
├── index.html          # Interface principale de saisie des stats
├── styles.css          # Styles globaux (thème rouge, responsive, print)
├── script.js           # Logique métier (PlayerStats, BasketStatsApp)
├── recap.html          # Page de récapitulatif de match
├── recap.css           # Styles du récapitulatif
├── recap.js            # Logique du récapitulatif
├── empty_PRF.json      # Template pour "Nouveau match" (12 joueuses)
└── .vscode/
    └── PROJECT_CONTEXT.md  # Ce fichier
```

---

## 🌿 Workflow Git & Branches

### Branches principales

| Branche | Usage | Boutons Import/Export |
|---------|-------|----------------------|
| **main** | Production (GitHub Pages) | ❌ NON |
| **dev** | Développement stable | ✅ OUI |
| **v2.0** | Nouvelles fonctionnalités majeures | ✅ OUI |

### Règles de workflow

1. **Développement :** Toujours travailler sur `dev` ou une branche feature
2. **Déploiement en production :**
   - Merger `dev` → `main`
   - **IMPORTANT :** Retirer les boutons Import/Export de `index.html` sur `main`
   - Push vers `main` déclenche le déploiement GitHub Pages
3. **Nouvelles versions majeures :** Créer une branche `v2.x` à partir de `dev`

---

## 🎨 Charte Graphique

- **Couleur principale :** Rouge Crimson `#DC143C`
- **Couleur secondaire :** Or `#FFD700` (boutons spéciaux, évaluation)
- **Dégradés :** `linear-gradient(135deg, crimson, darkred)`
- **Police :** System fonts (Arial, sans-serif)

---

## 🏗️ Architecture du Code

### Classes principales (script.js)

#### `PlayerStats`
```javascript
class PlayerStats {
    // 13 statistiques par joueuse
    tirs1ptReussis, tirs1ptTentes,
    tirs2ptsReussis, tirs2ptsTentes,
    tirs3ptsReussis, tirs3ptsTentes,
    rebondsOffensifs, rebondsDefensifs,
    passesDecisives, interceptions, contres,
    ballonsPerdus, fautesPro
    
    getTotalPoints()      // Calcul des points
    getEvaluation()       // Formule d'évaluation
}
```

**Formule d'évaluation :**
```
(Points + Rebounds + Assists + Interceptions + Blocks) - (Turnovers + Fouls)
```

#### `BasketStatsApp`
Gère toute la logique applicative :
- `players` : Array de `{id, name, numero, stats}`
- `addPlayer()` : Ajoute une joueuse
- `renderPlayer(player)` : Affiche une carte joueuse
- `updateStat()` : Met à jour une stat (+/-)
- `filterPlayers()` : Filtre par nom/numéro
- `saveToLocalStorage()` : Sauvegarde
- `loadFromLocalStorage()` : Chargement
- `exportToJSON()` : Export JSON avec téléchargement
- `importFromJSON()` : Import depuis fichier
- `nouveauMatch()` : Charge `empty_PRF.json`
- `cloturerMatch()` : Export JSON + ouvre récap

---

## 🔑 Points Techniques Critiques

### ⚠️ IDs des joueuses

**ATTENTION :** Les IDs sont générés avec `Date.now() + Math.random()` → **nombres décimaux**

```javascript
// ✅ CORRECT
const playerId = parseFloat(card.dataset.playerId);

// ❌ INCORRECT (casse la recherche sur mobile)
const playerId = parseInt(card.dataset.playerId);
```

### 🔍 Recherche insensible aux accents

```javascript
function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
```

Permet de trouver "Clémence" en tapant "cle".

### 📱 Optimisations Mobile

```css
.btn {
    min-width: 44px;
    min-height: 44px;  /* Touch targets Apple/Google */
    -webkit-tap-highlight-color: rgba(0,0,0,0.1);
    touch-action: manipulation;
}
```

### 💾 Structure localStorage

```javascript
{
    id: 1234567890.123,      // Float (Date.now() + Math.random())
    name: "Noémie TRICO",
    numero: "5",             // String, pas number
    stats: PlayerStats       // Instance complète
}
```

### 📄 Structure JSON (export/import)

```json
{
    "date": "12/01/2026 14:30:25",
    "nombreJoueuses": 12,
    "joueuses": [
        {
            "nom": "Noémie TRICO",
            "numero": "5",
            "statistiques": {
                "tirs1ptReussis": 2,
                "tirs1ptTentes": 3,
                "pourcentage1pt": "66.67%",
                // ... toutes les stats avec pourcentages calculés
            }
        }
    ]
}
```

---

## 🎯 Fonctionnalités Principales

### Page principale (index.html)

1. **Barre de recherche** : Filtre par nom ou numéro (insensible aux accents)
2. **Boutons de contrôle :**
   - ➕ Ajouter joueuse
   - 🔄 Nouveau match (charge `empty_PRF.json`)
   - 📥 Import / 📤 Export (dev/v2.0 uniquement)
   - ⭐ Clôturer match (export JSON + récap)
   - 🗑️ Reset
3. **Cartes joueuses :**
   - Numéro (input text, maxlength="2")
   - Nom (input text)
   - 🏀 TIRS : 1pt, 2pts, 3pts (réussis/tentés)
   - 📊 STATISTIQUES : Rebounds, Assists, Steals, Blocks, Turnovers, Fouls
   - Boutons +/- pour chaque stat
   - Affichage en temps réel : Points, Évaluation
   - Bouton ❌ pour supprimer

### Page récapitulatif (recap.html)

1. **Statistiques collectives** : Totaux d'équipe + pourcentages
2. **Statistiques individuelles** : Carte par joueuse (lecture seule)
3. **Optimisé pour impression :** 3 joueuses par page, ajustement couleurs

---

## 📝 Template empty_PRF.json

Contient 12 joueuses prédéfinies avec toutes les stats à 0 :
- Noémie, Ludivine, Camille, Océane, Apolline, Juliette, Louise, Chloé, Clara, Sarah, Clémence, Léa

**Utilisation :** Bouton "Nouveau match" charge ce fichier pour démarrer rapidement.

---

## 🐛 Bugs Résolus & Leçons Apprises

### Bug 1 : Recherche cassée sur mobile
**Cause :** `parseInt()` sur des IDs décimaux  
**Fix :** `parseFloat(card.dataset.playerId)`

### Bug 2 : Numéros non sauvegardés
**Cause :** Champ `numero` oublié dans localStorage  
**Fix :** Ajout dans `saveToLocalStorage()` et `loadFromLocalStorage()`

### Bug 3 : Recherche sensible aux accents
**Cause :** Comparaison directe de strings  
**Fix :** Fonction `normalizeText()` avec `NFD` normalization

### Bug 4 : Bouton "Clôturer" ne répond pas sur mobile
**Cause :** Touch target trop petit, pas de `touch-action`  
**Fix :** 44x44px min + `touch-action: manipulation`

### Bug 5 : Récap trop large sur mobile
**Cause :** Gaps et paddings fixes  
**Fix :** Media queries avec valeurs réduites

---

## 🚀 État Actuel (Janvier 2026)

### Branche `main` (Production)
- Version stable déployée sur GitHub Pages
- **Sans** boutons Import/Export

### Branche `dev`
- Version de développement stable
- **Avec** boutons Import/Export
- Dernière modification : Ajout export JSON dans `cloturerMatch()`

### Branche `v2.0` (Active)
- Branche pour nouvelles fonctionnalités majeures
- Créée le 12/01/2026
- **Prêt pour de gros ajouts**

---

## 💡 Prochaines Étapes Possibles (v2.0)

Idées pour évolution :
- 📊 Graphiques de stats
- 👥 Gestion d'équipes
- 🕐 Chronomètre de match
- 📈 Historique de matchs
- 🏆 Classements
- 🎨 Thèmes personnalisables
- 🌐 Mode multi-langue
- ☁️ Synchronisation cloud

---

## 🔧 Commandes Utiles

```bash
# Développement
git checkout dev
git add .
git commit -m "feat: description"
git push

# Nouvelle fonctionnalité
git checkout -b feature/nom-feature dev
git push -u origin feature/nom-feature

# Déploiement production
git checkout main
git merge dev
# ⚠️ Retirer Import/Export de index.html
git add index.html
git commit -m "chore: prepare production release"
git push

# Retour sur dev
git checkout dev

# V2.0
git checkout v2.0
```

---

## 📞 Support & Contexte

**Pour reprendre le développement sur un nouveau PC :**

1. Clone le repo : `git clone https://github.com/TissotPA/Match.git`
2. Checkout la branche de travail : `git checkout v2.0`
3. Ouvrir dans VS Code
4. Demander à Copilot : *"Lis le fichier .vscode/PROJECT_CONTEXT.md"*
5. Copilot aura tout le contexte ! 🎉

---

**Date de création :** 12 janvier 2026  
**Dernière mise à jour :** 12 janvier 2026 (Refactoring v2.0)  
**Mainteneur :** Pierre-Antoine Tissot

---

## 🎯 Changelog v2.0

### Refactoring Qualité Code (12/01/2026)

✅ **Variables CSS** : Toutes les valeurs hardcodées remplacées par des variables CSS (`:root`)
- Couleurs, espacements, font-sizes, touch-targets, shadows, transitions
- Maintenabilité ++, Cohérence visuelle garantie

✅ **JSDoc Complet** : Documentation de toutes les fonctions
- Descriptions détaillées des paramètres et retours
- Types explicités (@param, @returns)
- Exemples d'utilisation inline

✅ **Constantes** : Élimination des "magic numbers"
- `ID_MULTIPLIER`, `STORAGE_KEY`, `SESSION_RECAP_KEY`
- Messages d'erreur et de succès centralisés
- URLs configurables

✅ **Accessibilité** : ARIA labels sur tous les éléments interactifs
- role="search", role="article"
- aria-label sur tous les boutons et inputs
- Navigation clavier améliorée

✅ **Gestion d'Erreurs** : Try/catch systématique + validation popup
- Async/await au lieu de then/catch mixés
- Vérification window.open (popup blocker)
- Messages d'erreur utilisateur-friendly

✅ **Refactoring Code** : Élimination duplication
- `generatePlayerId()` : méthode dédiée
- `loadPlayerStats()` : réutilisable
- `normalizeText()` : fonction utilitaire globale
- Async/await cohérent partout

✅ **Performance** : Optimisations ciblées
- Optional chaining (?.) pour éviter erreurs null
- parseFloat() au lieu de parseInt() (IDs décimaux)
- Touch-action et tap-highlight optimisés

**Note Globale Actuelle** : **9.5/10** (était 7.5/10)

Reste à faire pour 10/10 : Tests unitaires + Linter configuré

