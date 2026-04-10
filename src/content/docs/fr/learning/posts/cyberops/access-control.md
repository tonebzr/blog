---
title : Cadres de sécurité de l'information, modèles de contrôle d'accès et opérations AAA
description : Un examen technique de la triade CIA, de l'architecture Zero Trust, des diverses méthodologies de contrôle d'accès et de la mise en œuvre opérationnelle des protocoles AAA au sein des environnements réseaux d'entreprise.
order: 19
---


## 1. La Triade CIA

La sécurité de l'information concerne la protection des informations et des systèmes d'information contre **l'accès, l'utilisation, la divulgation, la perturbation, la modification ou la destruction non autorisés**.

La triade CIA est le modèle fondamental de la sécurité de l'information, composé de trois propriétés essentielles :

```
        Confidentialité
              △
             / \
            /   \
           /     \
    Intégrité ——— Disponibilité
```

| Propriété | Définition | Exemple |
|---|---|---|
| **Confidentialité** | Seuls les individus, entités ou processus autorisés peuvent accéder aux informations sensibles | Chiffrement de fichiers ou d'appels VoIP pour empêcher toute écoute non autorisée |
| **Intégrité** | Protection des données contre toute modification non autorisée | Hachage d'un fichier pour détecter toute altération |
| **Disponibilité** | Les utilisateurs autorisés doivent disposer d'un accès ininterrompu aux ressources réseau et aux données dont ils ont besoin | Équilibrage de charge des serveurs web pour prévenir les interruptions de service |

> **Conseil d'examen :** La mise en œuvre de l'équilibrage de charge et de la redondance sur plusieurs serveurs web répond à l'exigence de **Disponibilité** de la triade CIA.

La cryptographie est l'outil principal pour assurer la **confidentialité** — la tendance est au chiffrement de toutes les communications.

---

## 2. Sécurité Zero Trust

### Principe Fondamental

> *« Ne jamais faire confiance, toujours vérifier. »*

Le Zero Trust est une approche globale pour sécuriser **tous les accès** sur les réseaux, les applications et les environnements. Il couvre les utilisateurs, les terminaux, les API, l'IoT, les microservices, les conteneurs, et bien plus encore.

**Idée clé :** Dans un modèle traditionnel, le périmètre réseau constituait la frontière de confiance (intérieur = fiable, extérieur = non fiable). En Zero Trust, **chaque point de décision de contrôle d'accès est considéré comme un périmètre** — un utilisateur préalablement authentifié doit se ré-authentifier pour accéder à une nouvelle ressource ou couche.

### Les Trois Piliers du Zero Trust

| Pilier | Périmètre | Objectif |
|---|---|---|
| **Personnel** | Employés, prestataires, partenaires, fournisseurs | Garantit que seuls les bons utilisateurs et les appareils sécurisés peuvent accéder aux applications, quel que soit leur emplacement |
| **Charges de travail** | Applications cloud, centres de données, environnements virtualisés | Sécuriser les accès entre les API, microservices et conteneurs interagissant avec les bases de données |
| **Lieu de travail** | Tous les appareils connectés au réseau (IoT, terminaux, serveurs, imprimantes, caméras, CVC, etc.) | Sécuriser l'accès pour chaque appareil sur le réseau de l'entreprise |

### Avantages du Zero Trust

- Prévient les accès non autorisés
- Contient les violations de sécurité
- Réduit le risque de **mouvement latéral** des attaquants au sein du réseau

---

## 3. Modèles de Contrôle d'Accès

Une organisation doit mettre en œuvre des contrôles d'accès appropriés pour protéger ses ressources réseau, ses ressources de systèmes d'information et ses données. La compréhension de ces modèles aide également les analystes en sécurité à identifier comment les attaquants peuvent tenter de les contourner.

| Modèle | Nom Complet | Caractéristiques Clés | Cas d'Usage Typique |
|---|---|---|---|
| **DAC** | Contrôle d'Accès Discrétionnaire | Le moins restrictif. Les **propriétaires** des données contrôlent l'accès à leurs propres données. Peut utiliser des ACL ou d'autres méthodes. | Environnements commerciaux, systèmes de fichiers |
| **MAC** | Contrôle d'Accès Obligatoire | Modèle le plus strict. Des étiquettes de sécurité sont attribuées aux informations ; les utilisateurs obtiennent l'accès selon leur **niveau d'habilitation**. | Militaire, applications critiques |
| **RBAC** | Contrôle d'Accès Basé sur les Rôles | Décisions d'accès fondées sur le **rôle et les responsabilités** de l'utilisateur dans l'organisation. Considéré également comme un contrôle d'accès non discrétionnaire. | Entreprises avec des rôles métier définis |
| **ABAC** | Contrôle d'Accès Basé sur les Attributs | Accès fondé sur les **attributs** de l'objet (ressource), du sujet (utilisateur) et des **facteurs environnementaux** (ex. : heure de la journée). Modèle le plus flexible. | Politiques d'accès dynamiques et granulaires |
| **AC Basé sur les Règles** | Contrôle d'Accès Basé sur les Règles | Le personnel réseau définit des **règles/conditions** associées à l'accès (ex. : adresses IP autorisées, protocoles). Aussi appelé RBAC basé sur des règles. | Pare-feux, ACL réseau |
| **TAC** | Contrôle d'Accès Temporel | Accorde l'accès aux ressources réseau selon le **moment et le jour**. | Accès planifiés, environnements par équipes |

### Comparaison des Modèles en un Coup d'Œil

```
Restrictivité (Faible → Élevée) :
DAC  ──────────  RBAC / ABAC / Règles  ──────────  MAC
(décision du propriétaire)  (décision de la politique)  (application stricte du système)
```

---

## 4. Principe du Moindre Privilège & Élévation de Privilèges

### Principe du Moindre Privilège

> Les utilisateurs et les processus doivent se voir accorder **le niveau d'accès minimum requis** pour accomplir leur fonction — rien de plus.

- Également décrit comme une approche **limitée et selon les besoins** pour l'attribution des droits
- S'applique aussi bien aux **comptes utilisateurs** qu'aux **processus logiciels**

### Élévation de Privilèges

Une attaque par **élévation de privilèges** exploite des vulnérabilités dans des serveurs ou des systèmes de contrôle d'accès pour accorder à un utilisateur non autorisé (ou à un processus logiciel) **un niveau de privilèges supérieur** à celui qui lui est dû.

Après l'élévation, l'acteur malveillant peut :
- Accéder à des informations sensibles
- Prendre le contrôle d'un système

> **Exemple d'élévation de privilèges :** Un acteur malveillant exploite une vulnérabilité dans une application pour obtenir un accès de niveau administrateur, alors qu'il n'est authentifié que comme utilisateur standard.

> **Contre-exemple (PAS une élévation de privilèges) :** Une attaque DDoS provoquant le crash d'un serveur — il s'agit d'un déni de service, pas d'une élévation de privilèges. Un scan de ports découvrant un service FTP ouvert relève de la reconnaissance, pas d'une élévation.

---

## 5. Cadre AAA

### Aperçu

Un réseau doit contrôler **qui** est autorisé à se connecter et **ce qu'il** est autorisé à faire. Ces exigences sont définies dans la **politique de sécurité réseau**. Le protocole **Authentification, Autorisation et Comptabilité (AAA)** fournit le cadre permettant une sécurité d'accès évolutive.

Les trois composantes indépendantes du AAA :

| Composante | Question Posée | Description | Exemple |
|---|---|---|---|
| **Authentification** | *Qui êtes-vous ?* | Vérifie l'identité des utilisateurs et des administrateurs via des identifiants, des jetons, des défis/réponses, etc. Assure un contrôle d'accès centralisé. | Connexion nom d'utilisateur + mot de passe |
| **Autorisation** | *Que pouvez-vous faire ?* | Détermine les ressources auxquelles l'utilisateur peut accéder et les opérations qu'il peut effectuer — **après** authentification. | « L'utilisateur 'étudiant' peut accéder au serveur hôte XYZ uniquement via SSH. » |
| **Comptabilité** | *Qu'avez-vous fait ?* | Enregistre ce à quoi l'utilisateur a accédé, pendant combien de temps, et toutes les modifications effectuées. Prend en charge la journalisation de conformité. | « L'utilisateur 'étudiant' a accédé au serveur hôte XYZ via SSH pendant 15 minutes. » |

> **Analogie :** Pensez à une carte de crédit — elle identifie qui peut l'utiliser (authentification), définit un plafond de dépenses (autorisation) et produit un relevé des achats (comptabilité).

### Exemple d'Entrée de Journal AAA

```
L'utilisateur étudiant a accédé au serveur hôte ABC via Telnet hier pendant 10 minutes.
```
Il s'agit d'une entrée de journal de **Comptabilité** — elle enregistre l'utilisateur, la ressource, la méthode et la durée.

---

## 6. Méthodes d'Authentification AAA

Cisco propose deux méthodes courantes pour implémenter les services AAA :

### Authentification AAA Locale

- Également appelée **authentification autonome**
- Authentifie les utilisateurs par rapport aux noms d'utilisateur et mots de passe **stockés localement**
- Idéale pour les **petits réseaux**
- **Limitation :** Ne passe pas bien à l'échelle — la gestion des identifiants sur chaque appareil individuellement devient impraticable à mesure que le réseau croît

```
Client Distant → [Routeur AAA (BDD locale)] → Réseau d'Entreprise
       1. Le client se connecte
       2. Le routeur demande les identifiants
       3. Le routeur vérifie la base locale → accorde/refuse l'accès
```

### Authentification AAA par Serveur

- Utilise un **serveur AAA centralisé**
- Privilégiée pour les environnements plus larges et d'entreprise — **plus évolutive et gérable**
- Prend en charge **Active Directory** ou **LDAP** pour l'authentification des utilisateurs et l'appartenance aux groupes
- Les appareils communiquent avec le serveur via les protocoles **RADIUS** ou **TACACS+**
- Permet des capacités de comptabilité complètes

```
Client Distant → [Client AAA/Routeur] → [Serveur AAA Centralisé (RADIUS/TACACS+)]
                                                  ↕
                                        [Active Directory / LDAP]
```

---

## 7. TACACS+ vs RADIUS

Les deux sont des protocoles AAA basés sur serveur, mais ils diffèrent significativement :

| Fonctionnalité | TACACS+ | RADIUS |
|---|---|---|
| **Standard** | Principalement propriétaire Cisco | Ouvert / Standard RFC |
| **Transport** | Port TCP **49** | Ports UDP **1812/1813** ou **1645/1646** |
| **Fonctions AAA** | Sépare l'Authentification, l'Autorisation et la Comptabilité (modularité complète) | Combine Authentification et Autorisation ; sépare la Comptabilité |
| **Confidentialité** | Chiffre l'**intégralité du corps** du paquet (seul l'en-tête n'est pas chiffré) | Chiffre **uniquement le mot de passe** dans le paquet de demande d'accès |
| **Protocole** | Défi/réponse bidirectionnel (CHAP) | Défi/réponse unidirectionnel du serveur vers le client |
| **Personnalisation** | Autorise les commandes du routeur sur une base **par utilisateur ou par groupe** | Pas d'autorisation de commandes par utilisateur/groupe |
| **Comptabilité** | Limitée | Étendue |
| **Idéal pour** | Administration des équipements réseau, contrôle granulaire | Accès réseau (VPN, Wi-Fi, accès commuté) |

> **Point clé :** Utilisez **TACACS+** lorsque vous avez besoin d'une autorisation granulaire des commandes sur les équipements réseau. Utilisez **RADIUS** pour une authentification d'accès réseau large et conforme aux standards.

---

## 8. Types de Comptabilité AAA

La comptabilité AAA collecte et rapporte les données d'utilisation dans les journaux AAA. Les types d'informations de comptabilité suivants peuvent être collectés :

| Type de Comptabilité | Ce qu'il Capture |
|---|---|
| **Comptabilité Réseau** | Toutes les sessions PPP — nombre de paquets et d'octets |
| **Comptabilité de Connexion** | Toutes les connexions sortantes depuis le client AAA (ex. : sessions SSH) |
| **Comptabilité EXEC** | Sessions de terminal EXEC utilisateur (shells) — nom d'utilisateur, date, heures de début/fin, IP du serveur |
| **Comptabilité Système** | Événements au niveau du système (ex. : redémarrages, activation/désactivation de la comptabilité) |
| **Comptabilité des Commandes** | Commandes de shell EXEC pour un niveau de privilège spécifié, avec horodatage et utilisateur |
| **Comptabilité des Ressources** | Enregistrements de début/fin pour les connexions ayant réussi (ou échoué) l'authentification utilisateur |

---

## 9. Concepts Clés – Référence Rapide

| Concept | Résumé |
|---|---|
| Triade CIA | Confidentialité, Intégrité, Disponibilité |
| Zero Trust | « Ne jamais faire confiance, toujours vérifier » — chaque point est un périmètre |
| DAC | Le propriétaire contrôle l'accès — le moins restrictif |
| MAC | Le système applique les étiquettes — le plus restrictif, usage militaire |
| RBAC | Accès par rôle/fonction métier |
| ABAC | Accès par attributs objet/utilisateur/environnement (le plus flexible) |
| Moindre Privilège | N'accorder que l'accès minimum nécessaire |
| Élévation de Privilèges | Exploitation de vulnérabilités pour obtenir un accès supérieur à celui autorisé |
| AAA | Authentification + Autorisation + Comptabilité |
| AAA Local | Identifiants stockés sur l'équipement — ne passe pas à l'échelle |
| AAA par Serveur | Centralisé, évolutif — utilise RADIUS ou TACACS+ |
| TACACS+ | TCP/49, sépare entièrement le AAA, chiffre le paquet complet, orienté Cisco |
| RADIUS | UDP/1812-1813, standard ouvert, combine authn/authz, chiffre uniquement le mot de passe |

---

