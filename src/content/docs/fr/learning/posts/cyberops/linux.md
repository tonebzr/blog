---

title: "Architecture, Administration et Opérations de Sécurité sous Linux"
description: "Analyse technique complète de l'architecture Linux, de la gestion du système de fichiers, de l'identification des serveurs et de l'analyse des journaux (logs) dans le contexte d'un SOC."
order: 4

---

## RÉSUMÉ DU MODULE

Linux est un système d'exploitation open-source et modulaire, caractérisé par sa fiabilité, ses faibles exigences matérielles et son haut degré de personnalisation. Dans un **Security Operations Center (SOC)**, Linux est la plateforme préférée car sa nature open-source permet de créer des environnements sur mesure spécifiquement pour l'analyse de sécurité. Le système d'exploitation est conçu avec une connectivité réseau native, facilitant le développement et le déploiement d'applications de sécurité basées sur le réseau.



L'**Interface en Ligne de Commande (CLI)**, ou **shell**, sert d'interprète de commandes principal, offrant un mécanisme puissant aux analystes pour interagir avec le système localement et à distance. Une caractéristique de sécurité critique de Linux est le contrôle granulaire fourni par l'**utilisateur root** (superuser), qui possède une autorité absolue sur le système, y compris sur les fonctions de bas niveau telles que la pile réseau.

---

## CONCEPTS CLÉS ET DÉFINITIONS

* **Distribution Linux (Distro)** : Un paquet contenant le noyau Linux regroupé avec des outils et logiciels spécifiques. Exemples : Debian, Red Hat, Ubuntu, et des distros spécialisées comme **Security Onion** (pour le SOC) ou **Kali Linux** (pour les tests de pénétration).
* **Shell** : L'interprète de commandes (ex: Bash) qui traite les instructions saisies par l'utilisateur.
* **Processus** : Programmes en cours d'exécution dans le système, fonctionnant souvent en arrière-plan en tant que services (**daemons**).
* **Montage (Mounting)** : Processus de liaison d'une partition physique sur un périphérique bloc (disque dur, clé USB) à un répertoire (point de montage) pour le rendre accessible à l'OS.
* **Fichiers Journaux (Log Files)** : Enregistrements générés par les logiciels, les services ou l'OS pour suivre des événements spécifiques pour le dépannage et l'audit de sécurité.

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Catégorisation des Outils du SOC
Le tableau suivant classifie les outils standards utilisés au sein d'un SOC pour la surveillance et la défense.

| Type d'outil | Fonction Technique | Exemple |
| :--- | :--- | :--- |
| **Capture de paquets** | Observe et enregistre chaque détail d'une transaction réseau. | **Wireshark** / **Tcpdump** |
| **Analyse de Malware** | Exécute et observe le malware en toute sécurité dans un environnement isolé. | **Cuckoo Sandbox** |
| **IDS/IPS** | Inspection du trafic en temps réel pour déclencher des alertes ou bloquer des flux. | **Snort** / **Suricata** |
| **SIEM** | Analyse et corrélation en temps réel des alertes et des logs. | **Security Onion / Sguil** |
| **Gestionnaire de Logs** | Facilite la surveillance et le stockage de volumes élevés de logs. | **Logstash** / **ELK** |
| **Système de Ticketing** | Enregistre, assigne et suit les alertes et les tâches de sécurité. | **RT** / **ServiceNow** |

### Permissions du Système de Fichiers Linux
Les permissions sont gérées à travers une triade d'entités : **User** (Propriétaire), **Group**, et **Others**. Elles sont souvent représentées en notation octale.

| Octal | Binaire | Type de Permission | Description |
| :--- | :--- | :--- | :--- |
| 4 | 100 | Lecture (r) | Permet de voir le contenu d'un fichier ou de lister un répertoire. |
| 2 | 010 | Écriture (w) | Permet de modifier un fichier ou d'ajouter/supprimer dans un répertoire. |
| 1 | 001 | Exécution (x) | Permet de lancer un programme ou d'entrer (`cd`) dans un répertoire. |
| 7 | 111 | Accès Total | Combinaison de Lecture, Écriture, et Exécution (4+2+1). |
| 0 | 000 | Aucun Accès | Toutes les permissions sont révoquées. |



---

## ANALYSE OPÉRATIONNELLE

### Identification des Processus et des Serveurs
Les analystes utilisent les commandes `ps` et `netstat` pour identifier les services actifs. La commande `sudo ps -elf` fournit une liste détaillée des processus avec le **PID** et le **PPID** (Parent PID).

**Cartographie des ports critiques (Surface d'attaque) :**
* **Port 21** : FTP (Transfert de fichiers, non sécurisé).
* **Port 22** : **SSH** (Accès distant sécurisé).
* **Port 23** : **Telnet** (Accès distant **non sécurisé**, texte en clair).
* **Port 25** : SMTP (Messagerie électronique).
* **Port 53** : **DNS** (Service de noms de domaine - UDP/53).
* **Port 80** : HTTP (Web, non chiffré).
* **Port 443** : HTTPS (Web sécurisé via TLS).

### Investigation des Fichiers Logs
Les fichiers logs résident généralement dans `/var/log`. Une entrée de log efficace comprend :
1.  **Horodatage (Timestamp)** : Crucial pour la corrélation temporelle des incidents.
2.  **Type** : Catégorie (ex: error, info, warning).
3.  **PID** : Identifie l'instance exacte du processus ayant généré l'événement.
4.  **Source/Client** : Adresse IP ou utilisateur initiant la transaction.
5.  **Description** : Détails techniques de l'événement.

```bash
# Exemple : Surveillance en temps réel des logs système
sudo tail -f /var/log/messages
```

---

## CAS PRATIQUES ET SPÉCIFICITÉS EXAMEN

### Durcissement (Hardening) et Vulnérabilités
* **Test de Pénétration** : Attaque simulée pour identifier les failles. Différent de l'**IDS**, qui est passif/défensif.
* **Device Hardening** : Désactiver les services inutiles, imposer des mots de passe forts, et restreindre l'accès physique (ex: désactiver l'auto-détection USB).
* **Liens Symboliques vs Matériels** :
    * **Symbolic Links (ln -s)** : Pointent vers un nom de fichier. Si la source change de nom, le lien est "cassé".
    * **Hard Links (ln)** : Pointent vers l'**inode** (le bloc de données sur le disque). Ils fonctionnent même si le fichier source est renommé.

### Référence des Commandes Shell
* `man [commande]` : Affiche le manuel d'utilisation.
* `pwd` : Affiche le répertoire actuel (**Print Working Directory**).
* `ls -l` : Liste le contenu avec les permissions et propriétaires détaillés.
* `lsblk` : Liste les périphériques blocs et points de montage.
* `cp / mv` : Copier / Déplacer ou Renommer.
* `sudo` : Exécute avec les privilèges root.
* `|` (Pipe) : Combine deux commandes (la sortie de l'une devient l'entrée de l'autre).
---