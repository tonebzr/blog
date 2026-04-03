---
title: "Architecture, Administration et Surveillance du Système Windows pour les Opérations de Cybersécurité"
description: "Analyse technique approfondie des processus, du Registre Windows, des commandes réseau et des outils d'administration pour la détection d'incidents et la préparation à l'examen Cisco CyberOps."
order: 3
---

## APERÇU DU MODULE

Ce module synthétise les composants critiques du système d'exploitation Windows nécessaires à un analyste **CyberOps Associate**. L'accent est mis sur la structure interne du système (Registre, Processus), l'utilisation de la ligne de commande (**CLI**) et de **PowerShell** pour l'audit, ainsi que sur l'application des politiques de sécurité via le pare-feu et les outils de surveillance. La compréhension de ces éléments est vitale pour identifier les vecteurs d'attaque et maintenir l'intégrité du système.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Structure et Hiérarchie du Registre Windows
Le Registre est la base de données centrale de configuration. Toute modification des paramètres utilisateur ou système y est stockée.

[Image de la hiérarchie du Registre Windows avec ses 5 ruches principales]

* **HKEY_CLASSES_ROOT (HKCR)** : Stocke les informations sur les associations d'extensions de fichiers et les enregistrements **OLE** (Object Linking and Embedding).
* **HKEY_CURRENT_USER (HKCU)** : Contient les configurations de l'utilisateur actuellement sessionné. C'est un lien dynamique vers une sous-clé de **HKEY_USERS**.
* **HKEY_LOCAL_MACHINE (HKLM)** : Contient les paramètres de configuration globaux (logiciels et matériel) applicables à tous les utilisateurs.
* **HKEY_USERS (HKU)** : Contient les profils de tous les comptes utilisateurs enregistrés sur l'hôte.
* **HKEY_CURRENT_CONFIG (HKCC)** : Stocke les informations sur le profil matériel utilisé au démarrage.

### Gestion des Processus et Unités d'Exécution
* **Processus** : Instance d'un programme en exécution disposant d'un **PID** (Process ID) unique.
* **Thread (Fil d'exécution)** : Unité de base à laquelle le système d'exploitation alloue du temps processeur. Un processus possède au moins un thread.
* **Handle (Descripteur)** : Ressource (fichier, clé de registre) vers laquelle un processus pointe pour effectuer des opérations.

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Comparaison des Versions et Limitations Système
Les spécifications techniques suivantes sont critiques pour l'évaluation de l'infrastructure :

| Caractéristique | Spécification / Valeur | Note Technique |
| :--- | :--- | :--- |
| **Limite RAM (32-bit)** | **4 Go** | Limite physique d'adressage pour les OS x86. |
| **Introduction 64-bit** | **Windows XP** | Première version grand public supportant l'architecture x64. |
| **Interpréteur par défaut** | **PowerShell** | Utilise des **cmdlets** (Verbe-Nom) et manipule des objets. |
| **Politique Pare-feu** | **Restrictive** | Tout ce qui n'est pas explicitement autorisé est interdit. |

### Outils de Surveillance et de Diagnostic
1. **Gestionnaire des tâches** : Surveillance rapide des applications, processus d'arrière-plan et services.
2. **Moniteur de ressources** : Analyse en temps réel de l'utilisation CPU, Mémoire, Disque et Réseau par PID.
3. **Analyseur de performances** : Permet la création de **Data Collector Sets** pour enregistrer des journaux (ex: `.csv`) sur une période définie.
4. **Observateur d'événements** : Indispensable pour l'analyse forensique (logs de connexion, erreurs système).

---

## ANALYSE OPÉRATIONNELLE

### Analyse Réseau via l'Interface de Ligne de Commande (CLI)
L'analyste utilise des commandes spécifiques pour auditer les connexions actives et la configuration :

* **`netstat -abno`** : Affiche toutes les connexions TCP/UDP actives, l'état de la connexion (LISTENING, ESTABLISHED), le PID et le nom de l'exécutable associé.
* **`net use`** : Commande permettant de mapper un lecteur réseau ou d'établir une connexion à un répertoire partagé distant.
* **`net start / stop [nom_du_service]`** : Contrôle direct des services système depuis la console.

### Administration et Navigation Système
* **`cd /`** : Commande pour retourner immédiatement à la racine (**Root Directory**) du lecteur actuel.
* **`Get-Alias [commande]`** : Sous PowerShell, permet de voir à quel cmdlet correspond une commande DOS (ex: `dir` est un alias pour `Get-ChildItem`).
* **`Clear-RecycleBin`** : Suppression définitive des fichiers de la corbeille via PowerShell.

---

## ÉTUDES DE CAS ET SPÉCIFICITÉS DE L'EXAMEN

### Scénario : Analyse Post-Incident
**Situation** : Un employé suspecte une intrusion nocturne sur son poste éteint la veille.
**Procédure d'audit** :
1. Consulter l'**Observateur d'événements** pour vérifier les événements de démarrage et de connexion durant l'absence de l'employé.
2. Analyser les journaux de l'**Analyseur de performances** si une collecte de données était active, pour identifier des pics de ressources inhabituels.

### Persistance et Registre
Un exemple classique de manipulation est la clé `EulaAccepted` dans les outils Sysinternals. Une valeur `0x00000001 (1)` indique une acceptation. Si un attaquant réinitialise cette valeur à `0`, cela peut servir à masquer l'utilisation préalable d'outils d'administration ou à provoquer une interaction utilisateur inattendue.

### Sécurité Réseau (Pare-feu Windows Defender)
* **Mode de fonctionnement** : Filtrage par ports.
* **Politique Permissive** : Autorise tout sauf ce qui est explicitement interdit (risqué).
* **Politique Restrictive** : Bloque tout sauf ce qui est explicitement autorisé (standard de sécurité moderne).
* **Configuration avancée** : Permet de créer des règles entrantes/sortantes basées sur des programmes, des ports ou des adresses IP spécifiques.