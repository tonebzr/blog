---
title: "Threat Intelligence and Network Security Communities"
description: "A technical examination of threat intelligence sources, open sharing standards, and operational platforms utilized to identify and mitigate evolving cybersecurity threats."
order: 20
---

# Module 20 — Threat Intelligence

> **Module Objective:** Use various intelligence sources to locate current and emerging security threats.


## Module Overview

To maintain an effective defensive posture, cybersecurity professionals must remain continuously informed regarding vulnerabilities and attack vectors as they evolve. This module analyzes the ecosystem of security organizations, the Cisco Talos intelligence group, FireEye security solutions, and the open standards that facilitate the automated exchange of **cyber threat intelligence (CTI)**.

> **Key Insight:** Threat intelligence is not only shared with personnel — it is also distributed directly to security systems such as firewalls and IDS/IPS engines, enabling automated, real-time protection.

---

## Core Concepts & Definitions

| Term | Definition |
| :--- | :--- |
| **Threat Intelligence** | Evidence-based knowledge about existing or emerging threats, used to inform decisions about how to respond |
| **Indicators of Compromise (IOC)** | Technical artifacts (file hashes, IP addresses, domain names) that indicate a system has been breached |
| **Tools, Techniques & Procedures (TTP)** | Behavioral patterns and methodologies employed by threat actors throughout an attack lifecycle |
| **Reputation Information** | Evaluative data on the trustworthiness of internet destinations or domains |
| **Zero-Day Threat** | A previously unknown vulnerability that is actively exploited before a patch is available |
| **CTI (Cyber Threat Intelligence)** | Structured information about adversaries, their capabilities, and their intentions |
| **SIEM** | Security Information and Event Management — aggregates and analyzes security event logs |
| **SOAR** | Security Orchestration, Automation and Response — automates responses to security incidents |

---

## Network Intelligence Communities

Security organizations provide resources, workshops, and conferences to help professionals remain current with the latest threats and vulnerabilities. The table below summarizes the most important ones.

| Organization | Full Name | Key Functions | Audience |
| :--- | :--- | :--- | :--- |
| **SANS** | SysAdmin, Audit, Network, Security Institute | Internet Storm Center (early warning); NewsBites (weekly news digest); @RISK (weekly new attack vectors); Flash security alerts; Reading Room (1,200+ research papers); security courses | Security practitioners worldwide |
| **MITRE** | The MITRE Corporation | Maintains the **CVE** database; assigns unique identifiers to publicly known vulnerabilities | Security vendors, researchers, government |
| **FIRST** | Forum of Incident Response and Security Teams | Brings together government, commercial, and educational CERTs; fosters cooperation in information sharing, incident prevention, and rapid reaction | Incident response teams globally |
| **ISC²** | International Information Systems Security Certification Consortium | Vendor-neutral education products; professional certifications; career services for 75,000+ professionals in 135+ countries | Security professionals worldwide |
| **CIS / MS-ISAC** | Center for Internet Security / Multi-State Information Sharing and Analysis Center | 24x7 cyber threat warnings and advisories; vulnerability identification; mitigation and incident response for SLTT governments | State, local, tribal, and territorial (SLTT) governments |

> **Exam Note:** SANS maintains the Internet Storm Center. ISC² provides *vendor-neutral education and career services*. MITRE maintains the CVE list. FIRST focuses on *incident response coordination*. CIS/MS-ISAC serves SLTT governments.

---

## Cisco Cybersecurity Reports

Cisco publishes two major threat intelligence reports that cybersecurity analysts should follow:

- **Cisco Annual Cybersecurity Report** — Yearly overview of the security landscape, threat actor methodologies, and preparedness recommendations.
- **Mid-Year Cybersecurity Report** — An interim update covering new developments, evolving threats, and emerging attack vectors (adware, spam campaigns, etc.).

These reports include expert analysis, statistics on top vulnerabilities, and mitigation strategies tailored to enterprise environments. They can be downloaded directly from the Cisco website.

---

## Security Blogs & Podcasts

Staying current requires ongoing engagement beyond formal reports. Key resources include:

| Resource Type | Provider | Details |
| :--- | :--- | :--- |
| **Blog** | Cisco Talos Group | Expert articles on emerging threats, malware analysis, and security research |
| **Blog** | Cisco Security (multiple authors) | Broad range of security-related topics from industry experts |
| **Podcast** | Cisco Talos | Series of **80+ podcasts** covering threat intelligence, research findings, and security news |

> Subscribe via email for blog notifications. Talos podcasts are available for streaming or download.

---

## Threat Intelligence Services

### Cisco Talos

**Cisco Talos** is one of the largest commercial threat intelligence teams in the world, comprising researchers, analysts, and engineers.

**Primary Mission:** Protect enterprise users, data, and infrastructure from active adversaries by collecting and operationalizing threat intelligence.

| Capability | Description |
| :--- | :--- |
| **Threat Collection** | Gathers data on active, existing, and emerging threats globally |
| **Real-Time Integration** | Cisco security products consume Talos intelligence in real time for immediate response |
| **Open Source Maintenance** | Maintains security rule sets for **Snort.org**, **ClamAV**, and **SpamCop** |
| **Free Resources** | Provides free software, services, resources, and data to the community |
| **IP/Domain Lookup** | Reputation Center allows search by IP, domain, or network owner for real-time threat data |
| **Educational Content** | Publishes 80+ podcasts and expert blogs |

> **Exam Note:** Talos's primary function is *collecting information about active, existing, and emerging threats* — not virus scanning or update monitoring.

---

### FireEye Helix Platform

**FireEye** uses a three-pronged approach: **security intelligence + security expertise + technology**.

**FireEye Helix** is a **cloud-hosted security operations platform** that integrates and enhances diverse security tools and threat intelligence into a single unified platform.

| Component | Details |
| :--- | :--- |
| **Architecture** | Combines **SIEM** and **SOAR** capabilities |
| **Threat Intelligence** | Backed by the **Mandiant worldwide threat intelligence network** |
| **Detection Engine** | Signature-less engine using **stateful attack analysis** to detect zero-day threats |
| **Behavioral Analysis** | Advanced threat detection via behavioral profiling — not reliant on known signatures |
| **Threat Vectors Covered** | Web, email, and file-share vectors; targets latent malware on file shares |
| **Attack Lifecycle Coverage** | Addresses all stages of an attack lifecycle |

> **Key Differentiator:** FireEye's signature-less detection engine can block advanced malware that *bypasses traditional signature-based defenses* — making it effective against zero-day threats.

---

### Common Vulnerabilities and Exposures (CVE)

The **U.S. government** sponsored the **MITRE Corporation** to create and maintain the **CVE catalog** — a dictionary of standardized identifiers for publicly known cybersecurity vulnerabilities.

```
CVE Purpose:
  - Assigns a unique CVE Identifier to each known vulnerability
  - Makes it easier to share vulnerability data across platforms and organizations
  - Acts as a common reference dictionary — NOT a malware signature database
  - NOT a list of response mechanisms
```

> **Exam Note:** CVE is strictly a *catalog for standardized identification* of vulnerabilities. It does not contain malware signatures or recommended response procedures.

---

### Automated Indicator Sharing (AIS)

**AIS** is a free service offered by the **U.S. Department of Homeland Security (DHS)**.

| Attribute | Detail |
| :--- | :--- |
| **Provider** | U.S. Department of Homeland Security (DHS) |
| **Cost** | Free |
| **Function** | Enables **real-time exchange** of cyberthreat indicators between the U.S. Federal Government and the private sector |
| **Standard Used** | STIX/TAXII for machine-readable exchange |

> **Exam Note:** AIS is the DHS-operated service. Do not confuse with Talos (Cisco), CVE (MITRE), or FireEye Helix (private vendor).

---

## Intelligence Sharing Open Standards

To enable machine-readable and automated communication of CTI across diverse platforms, several open standards have been developed.

### Why Open Standards?

Organizations and agencies use shared open standards **to enable the exchange of CTI in an automated, consistent, and machine-readable format** — not merely to update signature databases or synchronize antivirus tools.

### The Three Core Standards

```
┌─────────────────────────────────────────────────────────────────┐
│  STIX  →  Language   : Describes what the threat IS             │
│  TAXII →  Transport  : Defines HOW CTI is communicated (HTTPS)  │
│  CybOX →  Schema     : Specifies observable network events      │
└─────────────────────────────────────────────────────────────────┘
```

| Standard | Full Name | Role | Key Detail |
| :--- | :--- | :--- | :--- |
| **STIX** | Structured Threat Information Expression | Describes and packages CTI for exchange | Incorporates the CybOX standard |
| **TAXII** | Trusted Automated Exchange of Indicator Information | Application-layer protocol for CTI transport | Operates over HTTPS; designed to support STIX |
| **CybOX** | Cyber Observable Expression | Schema for specifying, capturing, and communicating network events and properties | Supports many cybersecurity functions; now part of STIX |

> **Exam Note:** **CybOX** is the standard that *specifies, captures, characterizes, and communicates events and properties of network operations*. TAXII is the *transport protocol*. STIX is the *expression language*.

### Malware Information Sharing Platform (MISP)

| Attribute | Detail |
| :--- | :--- |
| **Type** | Open-source platform |
| **Purpose** | Share IOCs for newly discovered threats |
| **Backing** | Supported by the **European Union** |
| **Scale** | Used by **6,000+ organizations** globally |
| **Export Formats** | STIX and other standard formats |
| **Function** | Enables automated sharing of IOCs between people and machines |

---

## Threat Intelligence Platforms (TIP)

As threat intelligence data proliferates across many sources and formats, **Threat Intelligence Platforms (TIP)** serve as centralized aggregators and normalizers.

### Three Major Types of TIP Data

```
1. Indicators of Compromise (IOC)
2. Tools, Techniques, and Procedures (TTP)
3. Reputation information about internet destinations or domains
```

### Core TIP Capabilities

| Function | Description |
| :--- | :--- |
| **Aggregation** | Centralizes data from multiple sources and formats into one location |
| **Normalization** | Converts diverse data formats into a consistent, usable structure |
| **Presentation** | Displays data in a comprehensible format for analyst consumption |
| **Automation** | Organizations can contribute intrusion data via automated feeds |

### Honeypots as a TIP Data Source

**Honeypots** are simulated networks or servers designed to attract and observe attackers. The intelligence gathered can be shared with TIP subscribers.

| Consideration | Detail |
| :--- | :--- |
| **Purpose** | Attract adversaries to observe attack techniques and collect IOCs |
| **Risk** | A compromised honeypot can become a pivot point into production networks |
| **Best Practice** | Host honeypots **in the cloud** to isolate them from production infrastructure |

---

## Exam Quick-Reference

| Question Topic | Correct Answer |
| :--- | :--- |
| Free DHS service for real-time CTI exchange with private sector | **AIS (Automated Indicator Sharing)** |
| World's leading commercial threat intelligence team (Cisco) | **Cisco Talos** |
| Cloud-hosted platform combining SIEM + SOAR | **FireEye Helix** |
| MITRE Corporation's primary contribution | **CVE (Common Vulnerabilities and Exposures)** |
| Primary function of ISC² | **Vendor-neutral education and career services** |
| Primary function of SANS | **Maintain the Internet Storm Center** (+ research, training) |
| Primary function of FIRST | **Foster cooperation in incident response and information sharing** |
| Standard that specifies and communicates network events/properties | **CybOX** |
| Protocol for transporting CTI over HTTPS | **TAXII** |
| Language for expressing/describing cyber threat information | **STIX** |
| CVE definition | **Dictionary of CVE Identifiers for publicly known cybersecurity vulnerabilities** |
| What Talos collects | **Information about active, existing, and emerging threats** |
| Open-source IOC sharing platform backed by EU | **MISP** |
| Why organizations use open CTI standards | **To enable automated, consistent, and machine-readable CTI exchange** |
| Blog and podcast provider for security professionals | **Cisco Talos** |
| Three types of threat intelligence data in a TIP | **IOC, TTP, Reputation information** |

---

> **Study Tip:** When answering exam questions, distinguish between the *provider* (who offers the service), the *function* (what it does), and the *format* (what standard it uses). Many distractors in questions deliberately mix these categories.