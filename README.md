# Abricot - Gestion de Projet

Application web collaborative pour gérer vos projets et tâches en équipe.

## Prérequis

- **Node.js** v18+ et npm
- **Git**
- Un terminal (cmd, PowerShell ou bash)

## Installation Rapide

### 1 - Cloner le projet

```bash
git clone https://github.com/hea-oc/oc-react-abricot
cd abricot
```

### 2️ - Installer les dépendances frontend

```bash
npm install
```

### 3️ - Installer et démarrer le backend

Le backend se trouve [ici](https://github.com/OpenClassrooms-Student-Center/dev-react-P10) 

```bash
cd ../dev-react-P10
npm install
```

Créer un fichier `.env` avec les variables nécessaires (voir [Backend README](https://github.com/OpenClassrooms-Student-Center/dev-react-P10))

Démarrer le backend :
```bash
npm run dev
```

Le backend démarre sur `http://localhost:8000`

### 4 - Démarrer le frontend

Revenir au dossier abricot :
```bash
cd ../../abricot
npm run dev
```

L'app démarre sur `http://localhost:3000`

## Utilisation

### Accès à la base de données (développement)

Le backend fournit Prisma Studio pour gérer la BD :

```bash
cd ../dev-react-P10
npx prisma studio
```

Cela ouvre une interface sur `http://localhost:5555`

### Données de test

Un script `seed` existe pour initialiser la BD avec des données de test :

```bash
cd ../dev-react-P10
npm run seed
```

**Utilisateur de test :**
- Email: `alice@example.com`
- Mot de passe: `password123`
