---
title: "Systèmes de Détection d'Intrusion & Architecture Security Onion"
description: "Guide de révision complet pour la certification CyberOps Associate — couvrant les composants de Security Onion, la classification des alertes, l'analyse déterministe vs probabiliste, les règles Snort et la configuration du pare-feu iptables."
order: 26
---

# Systèmes de Détection d'Intrusion & Architecture Security Onion

---

## 1. Security Onion — Vue d'ensemble de la plateforme

**Security Onion** est une distribution Linux conçue pour la **Supervision de la Sécurité Réseau (NSM)**. Elle fournit une plateforme intégrée offrant une visibilité télémétriques complète sur l'infrastructure réseau à travers trois fonctions opérationnelles principales :

| Fonction | Description |
| :--- | :--- |
| **Capture de données** | Capture complète de paquets (PCAP) + génération de métadonnées de session |
| **Détection d'intrusion** | Sondes réseau (NIDS) et agents hôtes (HIDS) |
| **Outils d'analyse des alertes** | Tableaux de bord et interfaces de flux de travail pour la corrélation analyste |

La plateforme centralise la détection afin de réduire le temps moyen de réponse (MTTR) et prend en charge l'analyse post-mortem via les données PCAP brutes.

---

## 2. Security Onion — Outils intégrés (Critique à l'examen)

### 2.1 Systèmes de Détection d'Intrusion Réseau (NIDS)

| Outil | Caractéristique principale | Astuce examen |
| :--- | :--- | :--- |
| **Snort** | Détection par signatures ; utilise une syntaxe de règles stricte pour inspecter les en-têtes et charges utiles des paquets ; architecture **mono-thread** | Génère des alertes d'intrusion réseau via des règles et signatures |
| **Suricata** | Détection par signatures + **multithreading natif** pour les flux à haut débit ; supporte l'identification de protocoles et l'extraction de fichiers en temps réel | Seul NIDS avec support natif du multithreading |
| **Zeek** *(anciennement Bro)* | Framework d'analyse réseau générant des journaux de métadonnées enrichis (HTTP, DNS, certificats SSL) sans nécessiter de capture complète des paquets pour chaque analyse | Orienté métadonnées ; n'est pas un moteur d'alerte traditionnel |

> ⚠️ **Piège à l'examen :** Zeek (anciennement Bro) est parfois référencé sous le nom « Bro » dans les questions plus anciennes. Il s'agit du même outil.

### 2.2 Systèmes de Détection d'Intrusion Hôte (HIDS)

| Outil | Description |
| :--- | :--- |
| **OSSEC** | HIDS open-source intégré à Security Onion ; réalise l'analyse de journaux, la surveillance d'intégrité des fichiers (FIM), la détection de rootkits et la supervision des politiques |
| **Wazuh** | HIDS moderne intégré à Security Onion ; évolution d'OSSEC avec des fonctionnalités améliorées |

> ✅ **Réponse à l'examen :** OSSEC et Wazuh sont tous deux des réponses valides pour « IDS hôte dans Security Onion ».

### 2.3 Outils d'Analyse & de Gestion

| Outil | Fonction principale | Astuce examen |
| :--- | :--- | :--- |
| **Sguil** | Console principale de gestion des alertes ; utilisée pour **initier les investigations de flux de travail**, pivoter vers les transcriptions de paquets et classifier les événements | **Point de départ des investigations analyste** |
| **Kibana** | **Interface tableau de bord interactive** vers les données **Elasticsearch** ; utilisée pour la visualisation et l'interrogation de grands jeux de données normalisés | Réponse pour « tableau de bord interactif vers Elasticsearch » |
| **PulledPork** | Utilitaire de gestion automatisée des signatures pour Snort ; **télécharge automatiquement les nouvelles règles** | Réponse pour « outil utilisé par Snort pour le téléchargement automatique des règles » |
| **Wireshark** | Outil GUI d'analyse de paquets ; utilisé pour afficher les captures de paquets complètes à des fins d'analyse | Utile mais n'est pas un outil de flux de travail d'alertes |

---

## 3. Matrice de Classification des Alertes (Critique à l'examen)

La classification précise des alertes est essentielle à l'efficacité du SOC. Elle quantifie la précision des systèmes de détection.

| Classification | Incident signalé ? | Incident survenu ? | Description | Réponse opérationnelle |
| :--- | :---: | :---: | :--- | :--- |
| **Vrai Positif (VP)** | ✅ Oui | ✅ Oui | L'IDS **identifie correctement** une activité malveillante / un exploit confirmé | Déclencher le protocole de réponse à incident |
| **Vrai Négatif (VN)** | ❌ Non | ❌ Non | Trafic bénin que l'IDS **ignore correctement** | Aucune action (état nominal) |
| **Faux Positif (FP)** | ✅ Oui | ❌ Non | Trafic légitime **incorrectement signalé** comme une menace | Affiner/ajuster les signatures IDS |
| **Faux Négatif (FN)** | ❌ Non | ✅ Oui | Une intrusion réelle **non détectée** par le système — les exploits passent inaperçus | Défaillance de sécurité critique ; révision des règles requise |

### Référence rapide QCM

| Question | Réponse |
| :--- | :--- |
| Aucune alerte, aucun incident | **Vrai Négatif** |
| L'alerte identifie correctement un exploit | **Vrai Positif** |
| Les exploits NE sont PAS détectés par les systèmes de sécurité | **Faux Négatif** |
| Alerte levée mais aucun incident ne s'est réellement produit | **Faux Positif** |

---

## 4. Méthodologie d'Analyse — Déterministe vs Probabiliste

| Attribut | **Analyse Déterministe** | **Analyse Probabiliste** |
| :--- | :--- | :--- |
| **Base logique** | Conditions prédéfinies et signatures fixes | Modélisation statistique et score de probabilité |
| **Application** | Protocoles standardisés sur **ports fixes bien connus** (ex. : TCP/80, TCP/443) | Comportements anormaux et ports dynamiques/éphémères |
| **Fiabilité** | Résultat binaire (Correspondance / Aucune correspondance) | Score de confiance basé sur la ligne de base historique |
| **Limitation** | Inefficace contre les menaces Zero-day | Risque plus élevé de faux positifs |

> ✅ **Réponse à l'examen :** *« Repose sur des conditions prédéfinies et peut analyser des applications utilisant des ports fixes bien connus »* → **Déterministe**
>
> ✅ **Réponse à l'examen :** *« Repose sur différentes méthodes pour établir la probabilité qu'un événement de sécurité se soit produit »* → **Probabiliste**

---

## 5. Anatomie d'une Règle Snort

L'efficacité de Snort repose sur sa structure de règles. Chaque règle comporte un **en-tête de règle** et des **options de règle**.

### Syntaxe de règle

```
action protocole ip_src port_src direction ip_dst port_dst (options)
```

### Exemple — Détection du ver Nimda

alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS 80 \
  (msg:"MALWARE-CNC Win.Trojan.Nimda.A"; content:"GET /admin.dll"; sid:1000001; rev:1;)

### Décomposition des composants

| Composant | Valeur | Description |
| :--- | :--- | :--- |
| **Action** | `alert` | Générer une alerte et journaliser l'événement |
| **Protocole** | `tcp` | Protocole de couche transport à inspecter |
| **Source** | `$EXTERNAL_NET any` | Variable réseau + tout port source |
| **Direction** | `->` | Unidirectionnel (source vers destination) |
| **Destination** | `$HTTP_SERVERS 80` | Variable réseau + port de destination |
| **msg** | `"Malicious Server Hit!"` | Message d'alerte lisible par l'humain |
| **content** | `"GET /admin.dll"` | Chaîne de charge utile à faire correspondre |
| **sid** | `1000001` | Identifiant unique de règle Snort |
| **rev** | `1` | Numéro de révision de la règle |

### Snort dans Security Onion

> **Fonction de Snort dans Security Onion :** **Générer des alertes d'intrusion réseau à l'aide de règles et de signatures**.

Snort surveille le trafic transitant par l'équipement réseau. Lorsque la charge utile d'un paquet correspond à une signature configurée (ex. : téléchargement d'un binaire malveillant connu), il écrit une entrée d'alerte dans `/var/log/snort/alert`.

**Exemple d'entrée d'alerte Snort :**
```
04/28-17:00:04.092153 [**] [1:1000003:0] Malicious Server Hit! [**] [Priority: 0]
{TCP} 209.165.200.235:34484 -> 209.165.202.133:6666
```

| Champ | Valeur |
| :--- | :--- |
| Horodatage | `04/28-17:00:04.092153` |
| ID de signature | `1:1000003:0` |
| Message d'alerte | `Malicious Server Hit!` |
| IP:Port source | `209.165.200.235:34484` |
| IP:Port destination | `209.165.202.133:6666` |

---

## 6. Réponse Pare-feu — iptables

Une fois qu'un **Vrai Positif** est confirmé par l'analyste, des mesures de confinement doivent être appliquées au niveau du pare-feu. Dans l'environnement CyberOps, cela s'effectue via **iptables** sur le routeur/pare-feu (R1).

### Logique des chaînes iptables

| Chaîne | Traite le trafic... | Exemple |
| :--- | :--- | :--- |
| **INPUT** | Arrivant sur l'équipement pare-feu lui-même | Pings entrants vers l'interface de R1 |
| **OUTPUT** | Originaire de l'équipement pare-feu | Réponses aux pings générées par R1 |
| **FORWARD** | Transitant *à travers* le pare-feu vers un autre hôte | Trafic routé par R1 entre les réseaux |

> ✅ Le trafic entre les utilisateurs internes et un serveur malveillant externe passe **à travers** R1 → utiliser la chaîne **FORWARD**.

### Blocage d'un serveur malveillant

```bash
# Bloquer le trafic TCP à destination du serveur malveillant sur le port 6666
iptables -I FORWARD -p tcp -d 209.165.202.133 --dport 6666 -j DROP
```

| Option | Signification |
| :--- | :--- |
| `-I FORWARD` | Insérer la règle en tête de la chaîne FORWARD |
| `-p tcp` | Faire correspondre le protocole TCP |
| `-d 209.165.202.133` | Faire correspondre l'IP de destination |
| `--dport 6666` | Faire correspondre le port de destination 6666 |
| `-j DROP` | Action : rejeter silencieusement le paquet |

### Vérification de la règle

```bash
iptables -L -v
```

La sortie attendue confirme la règle DROP dans la chaîne FORWARD :
```
Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target  prot opt  source    destination
    0     0 DROP    tcp  --   any       209.165.202.133  tcp dpt:6666
```

### Alternative plus agressive

Pour bloquer **tout** le trafic vers/depuis le serveur incriminé (pas seulement TCP/6666) :

```bash
iptables -I FORWARD -d 209.165.202.133 -j DROP   # Bloquer tout le trafic sortant vers l'attaquant
iptables -I FORWARD -s 209.165.202.133 -j DROP   # Bloquer tout le trafic entrant depuis l'attaquant
```

---

## 7. Étude de cas pratique — Ver W32.Nimda

Ce scénario retrace le flux de travail analyste complet, de l'alerte à la remédiation.

### Résumé du scénario

- **H10** simule un serveur malveillant internet exécutant nginx sur **TCP port 6666**
- **H5** (utilisateur interne) télécharge `W32.Nimda.Amm.exe` depuis `209.165.202.133:6666`
- **Snort** sur **R1** détecte la charge utile et écrit une alerte
- L'analyste utilise **Sguil** pour examiner l'alerte et pivoter vers les données PCAP
- L'analyste applique une **règle DROP iptables** sur R1 pour bloquer les connexions ultérieures

### Flux de travail analyste

```
[Alerte générée par Snort]
        |
        v
[Sguil — Initier l'investigation / Classifier l'alerte]
        |
        v
[Wireshark / tcpdump — Examiner le PCAP pour confirmation]
        |
        v
[Vrai Positif confirmé]
        |
        v
[iptables — Appliquer la règle DROP sur la chaîne FORWARD]
        |
        v
[Vérification — La nouvelle tentative wget échoue avec « Connection timed out »]
```

### Utilité du PCAP pour les analystes

Le fichier `.pcap` capturé (`nimda.download.pcap`) permet à l'analyste de :
- Reconstruire la session TCP complète
- Inspecter les en-têtes de requête/réponse HTTP
- Extraire le binaire malveillant depuis le flux
- Confirmer les horodatages exacts et les données transférées
- L'utiliser dans d'autres travaux pratiques pour une analyse approfondie des malwares

---

## 8. Trois Outils d'Analyse Intégrés à Security Onion

*(Le QCM demande de « Choisir trois »)*

Les trois principaux **outils d'analyse** dans Security Onion sont :

1. **Sguil** — Gestion des alertes et initiation du flux de travail
2. **Kibana** — Tableau de bord Elasticsearch et visualisation des données
3. **Wireshark** — Affichage et analyse des captures de paquets complètes

> ⚠️ Snort et Suricata sont des **moteurs de détection**, pas des outils d'analyse. OSSEC/Wazuh sont des agents **HIDS**.

---

## 9. Corrigé Complet des QCM

| Question | Réponse correcte | Justification |
| :--- | :--- | :--- |
| Aucune alerte signalée, aucun incident survenu | **Vrai Négatif** | Système correctement silencieux sur le trafic bénin |
| L'alerte identifie correctement un exploit | **Vrai Positif** | Détection correcte d'une activité malveillante réelle |
| Analyse utilisant des conditions prédéfinies + ports fixes bien connus | **Déterministe** | Logique de correspondance binaire sur des ports connus |
| Outil utilisé par Snort pour le téléchargement automatique des règles | **PulledPork** | Utilitaire de mise à jour automatique des règles |
| Interface tableau de bord interactive vers Elasticsearch | **Kibana** | Couche de visualisation pour Elasticsearch |
| Analyse basée sur la probabilité d'un événement de sécurité | **Probabiliste** | Approche statistique/comportementale |
| NIDS utilisant des signatures ET le multithreading natif | **Suricata** | Seul Suricata supporte nativement le multithreading |
| HIDS intégré à Security Onion | **OSSEC** | Agent HIDS principal (Wazuh également valide) |
| Trois outils d'analyse dans Security Onion | **Sguil, Kibana, Wireshark** | Outils principaux côté analyste |
| Fonction de Snort dans Security Onion | **Générer des alertes d'intrusion réseau via des règles/signatures** | Rôle central de l'IDS |
| Outil HIDS intégré à Security Onion | **Wazuh** | Remplacement/évolution moderne d'OSSEC |
| Outil pour initier une investigation de flux de travail | **Sguil** | Console analyste principale |
| Classe d'alerte indiquant que les exploits ne sont pas détectés | **Faux Négatif** | Détection manquée = faille critique |

---

## 10. Synthèse des Relations Clés

```
Security Onion
├── NIDS
│   ├── Snort          → Basé sur signatures, mono-thread, utilise PulledPork pour les mises à jour de règles
│   └── Suricata       → Basé sur signatures + multithreading natif
├── HIDS
│   ├── OSSEC          → Analyse de journaux, FIM, détection de rootkits
│   └── Wazuh          → Successeur amélioré d'OSSEC
├── Outils d'Analyse
│   ├── Sguil          → Console d'alertes, initiation du flux de travail, pivot PCAP
│   ├── Kibana         → Tableau de bord Elasticsearch
│   └── Wireshark      → Affichage des captures de paquets complètes
└── Outils de Support
    ├── Zeek (Bro)     → Journalisation des métadonnées réseau
    └── PulledPork     → Téléchargement automatique des règles Snort
```
