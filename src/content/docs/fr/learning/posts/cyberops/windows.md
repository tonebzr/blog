---
title: "Architecture Windows Avancée, Administration et Surveillance pour CyberOps"
description: "Analyse technique approfondie des composants internes de l'OS Windows, de la sécurité du système de fichiers, des séquences de démarrage et des opérations CLI pour la préparation à la certification Cisco CyberOps Associate."
order: 3
---

## MODULE OVERVIEW

La maîtrise de l'environnement Windows est une exigence fondamentale pour un analyste en sécurité au sein d'un centre d'opérations de sécurité (SOC). Ce module analyse l'architecture sous-jacente qui régit l'exécution des processus, les communications réseau et les mécanismes de persistance. En comprenant l'interaction entre le **Registre Windows**, le système de fichiers **NTFS** et le **processus de démarrage**, les analystes peuvent identifier efficacement les modifications non autorisées et maintenir l'intégrité du système hôte.



## CORE CONCEPTS & DEFINITIONS

### Architecture du Système de Fichiers : NTFS vs. FAT32
Le système **NTFS (New Technology File System)** est la norme pour les environnements Windows modernes, offrant des avantages significatifs en termes de sécurité et de fiabilité par rapport à l'ancien système **FAT32**.

* **Fonctionnalités de Sécurité** : NTFS prend en charge les **listes de contrôle d'accès (ACL)**, permettant des autorisations granulaires sur les fichiers et les dossiers.
* **Fiabilité** : Il intègre la **journalisation transactionnelle** (Journaling) et la **détection automatique des secteurs défectueux**, garantissant l'intégrité des données en cas de défaillance matérielle.
* **Évolutivité** : NTFS supporte des fichiers et des partitions de tailles nettement plus importantes que la limite de **4 Go** imposée par le FAT32.


### Séquence de Démarrage Windows
Comprendre l'ordre de démarrage est crucial pour identifier les "bootkits" ou les pilotes non autorisés se chargeant tôt dans la chaîne d'exécution. Après l'initialisation du BIOS/UEFI et du gestionnaire de démarrage (**bootmgr.exe**), la séquence est la suivante :

1.  **Amorçage du Système** : Le chargeur de démarrage Windows, **winload.exe**, prend la main pour charger les pilotes de démarrage critiques et la configuration du registre.
2.  **Chargement du Noyau** : Le noyau (**ntoskrnl.exe**) et la couche d'abstraction matérielle (**hal.dll**) sont transférés en mémoire.
3.  **Exécution du Noyau** : **ntoskrnl.exe** s'exécute, initialisant les composants internes (gestionnaire de mémoire, processus, etc.) et les pilotes système.
4.  **Gestion de Session** : Le gestionnaire de session (**smss.exe**) démarre, crée l'environnement utilisateur et lance le sous-système Windows (**csrss.exe**).
5.  **Ouverture de Session** : **winlogon.exe** est chargé pour gérer l'authentification et lancer le processus d'ouverture de session utilisateur.



### Protocoles de Réseau et Services
* **Server Message Block (SMB)** : Protocole de communication client-serveur utilisé pour le **partage de ressources réseau** telles que les fichiers et les imprimantes. C'est une cible fréquente pour les mouvements latéraux.
* **Netsh** : Utilitaire de ligne de commande permettant de **configurer les paramètres réseau** de l'ordinateur local ou distant, y compris les interfaces et le pare-feu.

## TECHNICAL TAXONOMY & CLASSIFICATION

### Outils d'Administration et d'Investigation
Ces outils sont essentiels pour corréler les événements système avec des violations potentielles de la sécurité.

| Outil | Commande d'Accès | Fonction de Sécurité Principale |
| :--- | :--- | :--- |
| **Windows Defender Firewall** | `wf.msc` | Applique une **politique restrictive** pour refuser ou autoriser le trafic. |
| **PowerShell** | `powershell.exe` | Environnement CLI objet utilisé pour les **scripts** et l'automatisation. |
| **Observateur d'Événements** | `eventvwr.msc` | Gère les journaux (Sécurité, Système, Application) pour l'audit. |
| **Éditeur du Registre** | `regedit.exe` | Base de données hiérarchique des configurations système et utilisateurs. |

### Référence de l'Interface de Ligne de Commande (CLI)
Les analystes doivent maîtriser l'invite de commande Windows pour l'interrogation rapide des hôtes.

| Commande | Résultat Opérationnel |
| :--- | :--- |
| **`dir`** | Liste les fichiers et sous-répertoires du répertoire courant. |
| **`cd`** | Modifie le répertoire de travail actuel. |
| **`ren`** | Renomme un fichier ou un répertoire spécifié. |
| **`mkdir`** | Crée un nouveau répertoire. |
| **`nslookup`** | Interroge les serveurs DNS pour vérifier la résolution de noms. |
| **`ping`** | Teste la connectivité et la résolution DNS via des requêtes ICMP Echo. |

## OPERATIONAL ANALYSIS

### Exécution PowerShell et Objets
PowerShell utilise des **cmdlets**, qui sont des classes .NET spécialisées effectuant des actions spécifiques. Contrairement aux shells textuels (comme Bash ou CMD), les cmdlets retournent des **objets** à la commande suivante dans le pipeline. Les scripts PowerShell utilisent l'extension de fichier **`.ps1`**.

### Gestion des Privilèges
Windows fonctionne sur le principe du moindre privilège. Si une application nécessite des droits élevés :
1.  L'utilisateur doit effectuer un clic droit sur l'exécutable.
2.  Sélectionner l'option **Exécuter en tant qu'administrateur**.
*Note technique* : Contrairement à Linux, les termes "root" ou "superuser" ne sont pas utilisés nativement dans la terminologie administrative de Windows.

### Audit Réseau et Logique du Pare-feu
Pour empêcher une application d'exfiltrer des données, on utilise le **Pare-feu Windows Defender avec fonctions avancées de sécurité**.
* **Règles Entrantes** : Contrôlent le trafic provenant du réseau vers l'hôte.
* **Règles Sortantes** : Contrôlent le trafic émis par l'hôte vers le réseau (crucial pour bloquer les communications C2).
* **Vérification** : La commande **`netstat -abno`** permet d'identifier le **PID** d'une application et de vérifier l'état des connexions (`ESTABLISHED`, `LISTENING`).

## CASE STUDIES & EXAM SPECIFICS

### Scénario : Échec d'un Service Persistant
Si un utilitaire tiers ne démarre pas automatiquement au démarrage du système :
* L'analyste doit inspecter la console des services (`services.msc`) pour vérifier que le **Type de démarrage** est défini sur "Automatique".
* Dans le registre, la clé `HKLM\SYSTEM\CurrentControlSet\Services\[NomDuService]` dicte les paramètres d'initialisation du service au niveau du noyau.

### Dépannage DNS
Pour vérifier si la résolution de noms DNS fonctionne correctement, les deux méthodes principales sont :
1.  **`nslookup [domaine]`** : Interroge directement le serveur DNS configuré.
2.  **`ping [domaine]`** : Tente une résolution de nom avant l'envoi de paquets ICMP ; si l'adresse IP s'affiche, la résolution est fonctionnelle.

### Analyse Forensique
La présence de la valeur `HKCU\Software\Sysinternals\PsExec\EulaAccepted` réglée sur 0x1 indique que l'utilisateur a accepté les conditions d'utilisation, soit manuellement via la fenêtre contextuelle, soit automatiquement via l'argument -accepteula. Bien que cet artefact suggère une intention ou une préparation à l'utilisation de `PsExec`, il ne constitue pas une preuve d'exécution du binaire. Cette valeur peut en effet être injectée à distance ou localement dans le registre par un script ou un fichier .reg avant tout lancement effectif, précisément pour contourner l'affichage de la licence.