# 🌟 Application ABA - Économie de Jetons

Une application web interactive pour l'Applied Behavior Analysis (ABA) avec système de drag & drop et économie de jetons personnalisable.

## 📋 Description

Cette application permet aux thérapeutes ABA et aux éducateurs de créer des activités interactives motivantes pour les enfants. Elle combine un système de jetons colorés avec un système de récompenses configurables.

## ✨ Fonctionnalités

### 🎯 Zone "Je travaille pour"
- **Pictogrammes personnalisables** : 16 émojis au choix
- **Description textuelle** : Zone pour décrire l'activité récompense
- **Configuration simple** : Interface intuitive pour personnaliser

### 💰 Économie de jetons
- **Objectif configurable** : De 1 à 10 jetons
- **Barre de progression** : Visualisation en temps réel
- **Représentation visuelle** : Étoiles dorées pour les jetons gagnés
- **Modal de célébration** : Animation quand l'objectif est atteint

### 🧺 Système de jetons
- **Drag & Drop** : Glisser-déposer intuitif
- **8 couleurs différentes** : Rouge, Bleu, Cyan, Vert, Jaune, Violet, Orange, Rose
- **Retour au panier** : Clic pour remettre un jeton
- **Feedback visuel** : Animations et effets visuels

## 🚀 Installation et déploiement

### Option 1: GitHub Pages (Recommandé)
1. Créez un repository GitHub public
2. Uploadez tous les fichiers du projet
3. Activez GitHub Pages dans les paramètres
4. Votre app sera accessible à : `https://votrenom.github.io/nom-repo/`

### Option 2: Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier du projet
3. URL publique générée automatiquement

### Option 3: Vercel
1. Connectez votre GitHub à [vercel.com](https://vercel.com)
2. Déploiement automatique en quelques secondes

## 📁 Structure du projet

```
aba-token-economy/
├── index.html          # Page principale
├── app.js              # Logique React de l'application
├── styles.css          # Styles personnalisés
├── README.md           # Documentation
└── assets/             # (Futur) Images et ressources
    └── icons/          # (Futur) Pictogrammes personnalisés
```

## 🛠️ Technologies utilisées

- **React 18** : Framework JavaScript
- **Tailwind CSS** : Framework CSS utilitaire
- **HTML5** : Structure sémantique
- **ES6+** : JavaScript moderne
- **CSS3** : Animations et responsive design

## 🎨 Personnalisation

### Ajouter de nouveaux jetons
Dans `app.js`, modifiez le tableau `tokens` :
```javascript
const [tokens, setTokens] = useState([
  { id: 9, color: '#nouveau-couleur', label: 'Nouveau', inBasket: true },
  // ... autres jetons
]);
```

### Ajouter de nouveaux pictogrammes
Dans `app.js`, modifiez le tableau `availableEmojis` :
```javascript
const availableEmojis = ['🎮', '📱', '🆕', /* nouveaux emojis */];
```

### Modifier les styles
Éditez `styles.css` pour personnaliser :
- Couleurs du thème
- Animations
- Responsive design
- Mode sombre

## 🧠 Bénéfices thérapeutiques ABA

- **Renforcement positif** : Système de récompenses immédiat
- **Motivation visuelle** : Progression claire et engageante
- **Développement moteur** : Coordination œil-main avec le drag & drop
- **Apprentissage des couleurs** : Reconnaissance et nomination
- **Cause à effet** : Actions immédiates et feedback
- **Personnalisation** : Adaptation aux préférences individuelles

## 🔄 Évolutions prévues

### Version 2.0
- [ ] Sauvegarde des profils utilisateurs
- [ ] Statistiques et rapports de progression
- [ ] Sons et effets audio
- [ ] Mode hors-ligne (PWA)
- [ ] Import/export de configurations

### Version 2.1
- [ ] Pictogrammes personnalisés uploadables
- [ ] Thèmes de couleurs multiples
- [ ] Gestion multi-utilisateurs
- [ ] API pour intégration avec d'autres outils ABA

### Version 3.0
- [ ] Intelligence artificielle pour suggestions
- [ ] Synchronisation cloud
- [ ] Application mobile native
- [ ] Tableau de bord thérapeute

## 📞 Support et contribution

Pour signaler un bug ou suggérer une amélioration :
1. Créez une issue sur GitHub
2. Décrivez le problème ou la suggestion
3. Ajoutez des captures d'écran si pertinent

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation pour des fins éducatives et thérapeutiques.

## 👥 Crédits

Développé pour les professionnels ABA et les éducateurs spécialisés.
Conçu avec ❤️ pour aider les enfants dans leur apprentissage.

---

**Version actuelle : 1.0.0**  
**Dernière mise à jour : Juin 2025**