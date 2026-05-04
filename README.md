# AfriConnect — Réseau Professionnel Africain

AfriConnect est une application web fullstack inspirée de LinkedIn, conçue pour connecter les professionnels en Afrique, faciliter le networking et améliorer l’accès aux opportunités locales.

---

## Fonctionnalités principales

* Authentification sécurisée (inscription / connexion)
* Gestion de profil utilisateur (photo, bio, compétences, expériences)
* Publications (posts avec texte et images)
* Système de likes et commentaires
* Connexions entre utilisateurs
* Messagerie privée en temps réel
* Dashboard utilisateur
* Suggestions de profils (recommandation simple)
* Interface administrateur

---

## Stack Technique

### Frontend

* React.js / Next.js
* CSS / Tailwind (si utilisé)

### Backend

* Node.js avec Express (ou Django selon l’implémentation)
* API REST

### Base de données

* PostgreSQL

### Autres technologies

* WebSockets (Socket.io) pour le temps réel
* JWT pour l’authentification

---

## Structure du projet

```bash
backend/
│── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   └── utils/

frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
```

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-username/africonnect.git
cd africonnect
```

---

### 2. Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` :

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/africonnect
JWT_SECRET=your_secret_key
```

Lancer le serveur :

```bash
npm run dev
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

---

## Tests

* Tester les routes API avec Postman
* Vérifier :

  * Authentification
  * Création de posts
  * Ajout de connexions
  * Messagerie

---

## Sécurité

* Hash des mots de passe (bcrypt)
* Authentification JWT
* Validation des données
* Gestion des erreurs

---

## Déploiement

Le projet peut être déployé sur :

* Frontend : Vercel / Netlify
* Backend : Render / Railway
* Base de données : PostgreSQL (Railway / Supabase)

##

---

## Objectif du projet

Ce projet a été réalisé pour :

* améliorer mes compétences en développement fullstack
* comprendre l’architecture d’une application scalable
* créer un projet professionnel pour mon portfolio GitHub

---

## Auteur

Mouhamed Rassoul Niang
Étudiant en informatique — spécialisé en développement web et intéressé par l’intelligence artificielle

---

## Améliorations futures

* Recherche avancée
* Version mobile
* Recommandation basée sur IA
* Intégration de services premium

---

## Contribution

Les contributions sont les bienvenues. N’hésitez pas à proposer des améliorations.

---

## Licence

Ce projet est open-source et disponible sous licence MIT.
