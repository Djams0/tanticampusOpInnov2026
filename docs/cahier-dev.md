# Cahier de Développement – Application Tontine

## 1. Contexte

Les interfaces d’inscription et de connexion sont déjà créées. Ce document détaille les prochaines étapes de développement pour compléter l'application de gestion de tontines communautaires.

## 2. Pages à développer

### Page Accueil (Dashboard)

**Objectif :** Offrir une vue synthétique de l'activité de l'utilisateur.

**Fonctionnalités :**
- Résumé des tontines actives
- Prochaines échéances
- Dernières transactions
- Alertes administratives ou suggestions de groupes

### Page Portefeuille

**Objectif :** Gérer les fonds et suivre les opérations.

**Fonctionnalités :**
- Solde disponible
- Historique des entrées/sorties
- Ajout ou retrait de fonds (via compte bancaire ou mobile money)
- Lien avec les cotisations de tontines

### Page Nouvelle Tontine

**Objectif :** Permettre de créer ou rejoindre une tontine.

**Fonctionnalités :**
- Création : nom, montant, fréquence, nombre de membres, règles, pénalités
- Rejoindre une tontine via un code (soumis à validation)
- Affichage des invitations en attente

### Page Notifications

**Objectif :** Centraliser les messages et rappels importants.

**Fonctionnalités :**
- Rappels de paiement
- Réception des fonds
- Invitations et alertes administratives
- Avertissements (affectant le score)

### Page Profil

**Objectif :** Gérer l'identité et la fiabilité utilisateur.

**Fonctionnalités :**
- Modifier ses informations (nom, bio, photo)
- Voir son score de confiance
- Voir les profils des autres membres (publics, anonymisés)
- Score de confiance (sur 100) affecté par les comportements
- Historique des avertissements

## 3. Système de Score de Confiance

- Score de départ : 100/100
- Chaque avertissement : -10 points, effet pendant 5 mois
- Score ≤ 50 : participation aux tontines bloquée
- Score > 50 : débloque l'accès
- Seul le créateur peut envoyer un avertissement
- Visualisable dans la section Profil

## 4. Simulation du Parcours Utilisateur

**Étape 1 : Inscription**  
L'utilisateur s’inscrit via un formulaire (nom, prénom, email, mot de passe).

**Étape 2 : Connexion**  
Il accède à son tableau de bord via ses identifiants.

**Étape 3 : Participation à une Tontine**  
- L’utilisateur entre un code de tontine dans l’espace “Rejoindre une tontine”.
- Le code est vérifié côté serveur.
- Une demande est envoyée à l'administrateur de la tontine.
- L’administrateur accepte ou refuse.

**Étape 4 : Accès confirmé**  
- L’utilisateur reçoit une notification “Vous avez rejoint la tontine [Nom]”.
- Il peut voir la liste des membres et les prochaines échéances.

**Étape 5 : Approvisionnement du Portefeuille**  
- L’utilisateur crédite son portefeuille via Mobile Money ou carte bancaire.
- Son solde est mis à jour et visible.

**Étape 6 : Cotisation**  
- À chaque échéance, il reçoit une notification de paiement.
- Il paie directement via son portefeuille.

**Étape 7 : Tour de Bénéfice**  
- Une notification s'affiche : “C’est votre tour de recevoir la cagnotte.”
- Le montant est versé automatiquement sur son portefeuille.

**Étape 8 : Score de Confiance**  
Dans le profil, l’utilisateur voit :
- Score actuel (ex : 100/100)
- Historique des avertissements (si existants)
- État (Actif ou Restreint)

**Étape 9 : Modification du Profil**  
Il peut :
- Modifier sa photo, nom, bio
- Mettre à jour ses contacts
- Activer la double authentification

**Étape 10 : Voir les autres membres**  
Accès aux profils anonymisés :
- Nom, score de confiance, nombre de tontines
- Contact restreint à l’admin

**Étape 11 : Action de l’Administrateur**  
L’administrateur peut envoyer un avertissement à un membre :
- Le score de l’utilisateur concerné baisse de 10 points
- Le badge "Avertissement actif" est visible pendant 5 mois
- Si le score ≤ 50, la participation à toute nouvelle tontine est bloquée

## 5. Règles Automatiques

| Condition | Conséquence |
|-----------|-------------|
| Score ≤ 50 | Blocage de participation |
| Avertissement | -10 points pour 5 mois |
| Fin des 5 mois sans nouveaux avertissements | +10 points (score remonte) |
| Paiements en retard (configurable) | Avertissement automatique ou manuel selon règle du créateur |