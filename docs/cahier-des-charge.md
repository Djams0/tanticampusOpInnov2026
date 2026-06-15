# 📘 CAHIER DE CHARGE – TONTICAMPUS (VERSION MISE À JOUR)

---

# SOMMAIRE

A. Présentation du projet
A.1 Contexte
A.2 Problématique
A.3 Objectifs
A.4 Périmètre du projet

B. Expression des besoins
B.1 Cible
B.2 Concurrents
B.3 Scénarios d’utilisation

C. Fonctionnalités attendues
C.1 Fonctionnalités détaillées
C.2 Interfaces & UX/UI

D. Spécifications techniques
D.1 Architecture technique actuelle
D.2 Sécurité et qualité logicielle
D.3 API et communication

E. Méthode de travail
E.1 Phases du projet
E.2 Gestion de projet
E.3 Tests, CI/CD et livrables

---

# A. PRÉSENTATION DU PROJET

## A.1 Contexte

Dans un contexte où les étudiants rencontrent des difficultés croissantes pour financer leurs projets (startup, formation, matériel, activités freelances), les solutions classiques restent limitées, rigides ou difficiles d’accès.

La tontine, modèle d’épargne collective basé sur la solidarité et la rotation des fonds, est une solution historiquement efficace mais peu digitalisée et souvent non sécurisée.

TontiCampus vise à transformer ce modèle en une **plateforme web sécurisée, automatisée et transparente**, adaptée aux étudiants.

---

## A.2 Problématique

Comment permettre aux étudiants de financer leurs projets grâce à un système solidaire fiable, sécurisé, automatisé et transparent, tout en évitant les problèmes classiques des tontines traditionnelles (fraude, impayés, manque de suivi) ?

---

## A.3 Objectifs

* Faciliter l’accès au financement étudiant
* Digitaliser et sécuriser les tontines
* Automatiser les paiements et cotisations
* Créer une communauté collaborative étudiante
* Réduire les risques d’impayés via un système de score
* Fournir une plateforme scalable et maintenable

---

## A.4 Périmètre du projet

### Inclus :

* Application web full-stack
* Gestion des tontines
* Authentification utilisateur (JWT)
* Portefeuille virtuel
* Notifications système
* Score de confiance utilisateur
* Tableau de bord

### Exclus :

* Application mobile native (future évolution)
* Crédit bancaire / microcrédit
* Trading ou investissement externe

---

# B. EXPRESSION DES BESOINS

## B.1 Cible

* Étudiants (18–30 ans)
* Jeunes entrepreneurs
* Freelancers étudiants
* Personnes ayant revenus réguliers (bourse, job étudiant)

---

## B.2 Concurrents

* Crowdfunding (Kickstarter, GoFundMe)
* Banques et prêts étudiants
* Tontines traditionnelles non digitalisées

👉 Différenciation TontiCampus :

* automatisation
* transparence
* scoring utilisateur
* gestion sécurisée des fonds

---

## B.3 Scénarios d’utilisation

* Financement d’une startup
* Achat de matériel professionnel
* Paiement de formation
* Épargne collective sécurisée

---

# C. FONCTIONNALITÉS ATTENDUES

## C.1 Fonctionnalités principales

### 1. Authentification & sécurité

* Inscription / connexion JWT
* Protection des routes
* Gestion des sessions
* Middleware d’erreurs global

---

### 2. Gestion des tontines

* Création de tontine
* Paramètres :

  * montant
  * fréquence
  * nombre de membres
  * règles de rotation
* Rejoindre via invitation/code
* Validation par administrateur

---

### 3. Portefeuille utilisateur

* Solde virtuel
* Historique transactions
* Dépôt / retrait simulé ou API paiement
* Liaison avec tontines

---

### 4. Notifications

* Paiements à effectuer
* Alertes de retard
* Invitations tontines
* Notifications système centralisées

---

### 5. Système de score (fiabilité)

* Score initial : 100
* -10 points par incident
* Blocage si score < 50
* Historique des sanctions
* Récupération progressive

---

### 6. Module communautaire (prévu)

* Forum étudiants
* Mentorat
* Discussions thématiques

---

## C.2 UX/UI

### Pages principales

* Page Accueil (marketing + onboarding)
* Authentification (login/register)
* Dashboard (vue globale)
* Portefeuille
* Création tontine
* Gestion tontine
* Notifications
* Profil utilisateur

---

### Améliorations UX obligatoires

* Messages d’erreurs clairs (frontend + backend)
* États de chargement (loading states)
* Gestion des erreurs API (try/catch global)
* Toast notifications
* UI responsive (mobile-first)
* Protection des pages non authentifiées

---

# D. SPÉCIFICATIONS TECHNIQUES

## D.1 Architecture actuelle

### Stack réelle du projet :

* Frontend : React (build servi par Nginx)
* Backend : Node.js + Express
* Base de données : PostgreSQL
* Conteneurisation : Docker + Docker Compose
* Proxy : Nginx (frontend)
* Communication : REST API

---

### Architecture globale

```
[ React (Nginx) ]
        ↓
   [ API Express ]
        ↓
 [ PostgreSQL DB ]
```

---

### Communication inter-service

* Frontend → API via HTTP
* API → DB via pool PostgreSQL
* Docker network interne (api / db / front)

---

## D.2 Sécurité et robustesse

### Obligatoire :

* JWT auth sécurisée
* Hash bcrypt pour mots de passe
* CORS configuré proprement
* Validation des inputs (express-validator)
* Middleware error handling global
* Logs structurés

---

### Gestion des erreurs (IMPORTANT)

* Centralized error middleware Express
* Try/catch partout API
* Frontend fallback UI
* Timeout API requests
* Messages utilisateur propres

---

## D.3 API Design

### Endpoints principaux

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify

GET  /api/tontines
POST /api/tontines
POST /api/tontines/join

GET  /api/wallet
POST /api/wallet/deposit

GET  /api/notifications
GET  /api/profile
```

---

# E. MÉTHODE DE TRAVAIL

## E.1 Phases

### 1. Analyse

* Cahier des charges
* architecture
* user stories

### 2. Développement MVP

* Auth
* Tontines
* Dashboard

### 3. Stabilisation

* correction bugs
* gestion erreurs
* tests API

### 4. Sécurisation

* JWT
* validation
* rate limiting

### 5. Finalisation

* UI/UX polish
* documentation
* déploiement

---

## E.2 Gestion de projet

* Agile Scrum
* Sprints 1–2 semaines
* backlog GitHub Issues
* review code systématique



---

### Critères de validation finale

✔ Aucun “Failed to fetch”
✔ API accessible depuis frontend
✔ DB connectée sans erreur
✔ Tous endpoints testés
✔ UX sans blocage
✔ Logs propres

