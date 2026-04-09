---
title: "Network Defense Architectures and Security Methodologies"
description: "An advanced technical analysis of asset management, layered defense-in-depth strategies, BYOD policies, and the implementation of organizational security policies within modern network infrastructures."
order: 18
---

## MODULE OVERVIEW

The rapid expansion of the **Internet of Things (IoT)** and the proliferation of mobile endpoints have significantly increased the complexity of network protection. Organizations are now required to secure internal resources, remote personnel, and virtualized cloud services against sophisticated threat actors who exploit vulnerabilities within the network infrastructure.

This module provides a rigorous technical framework for explaining network security defense approaches and the policy-driven practices required to maintain a resilient security posture. Key topics include:

- Identifying assets, vulnerabilities, and threats
- Applying defense-in-depth strategies (Onion and Artichoke models)
- Understanding and implementing organizational security policies
- Managing BYOD risk through best practices and MDM
- Regulatory and standards compliance obligations

---

## CORE CONCEPTS & DEFINITIONS

Effective cybersecurity operations require the precise identification of three critical components: **Assets**, **Vulnerabilities**, and **Threats**.

| Component | Definition | Examples |
| :--- | :--- | :--- |
| **Assets** | Any entity of value to an organization that must be protected | Servers, infrastructure devices, end devices, data |
| **Vulnerabilities** | A weakness in a system or its design that could be exploited by a threat actor | Unpatched software, misconfigured ACLs, weak credentials |
| **Threats** | Any potential danger or event that could compromise the integrity, availability, or confidentiality of an asset | Malware, insider attacks, data breaches, physical disasters |

> **Attack Surface**: The collection of all assets owned or managed by an organization that threat actors could target. As an organization grows (organically or via mergers), so does its attack surface — often faster than its inventory practices can keep up.

### Asset Management

Asset management involves the **continuous inventorying and assessment** of all managed devices and information to determine the requisite level of protection. Key considerations include:

- Many organizations only have a *general* idea of what assets they need to protect, particularly following mergers or rapid growth.
- Critical information assets vary by industry: a retailer holds credit card data, an engineering firm stores proprietary designs, a bank manages financial records.
- Each asset category attracts **different threat actors** with different skill levels and motivations.

---

## THREAT IDENTIFICATION

When identifying threats, cybersecurity analysts must systematically answer three questions:

1. **What are the possible vulnerabilities of a system?**
2. **Who may want to exploit those vulnerabilities to access specific information assets?**
3. **What are the consequences if system vulnerabilities are exploited and assets are lost?**

Identifying vulnerabilities on a network requires an understanding of the important applications in use, as well as the specific vulnerabilities of that application and hardware — a task that demands significant research by the network administrator.

### E-Banking Threat Model (Case Study)

The following table maps the threat landscape for a representative e-banking environment:

| Threat Vector | Description | Asset at Risk |
| :--- | :--- | :--- |
| **Internal System Compromise** | Attacker pivots from exposed e-banking servers to internal bank systems | Internal infrastructure |
| **Customer Data Exfiltration** | Unauthorized access to personal and financial data in the customer database | Confidentiality of customer records |
| **Phony Transactions (Server-side)** | Attacker alters e-banking application code to impersonate a legitimate user | Transaction integrity |
| **Credential/Smart Card Theft** | Attacker steals a customer's PIN or card to execute malicious transactions | Authentication integrity |
| **Insider Attack** | A bank employee discovers and exploits a system flaw | All internal assets |
| **Data Input Errors** | A user inputs incorrect data or makes erroneous transaction requests | Data accuracy |
| **Data Center Destruction** | A cataclysmic event damages or destroys the data center | Availability of all services |

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Defensive Architecture: Defense-in-Depth

Organizations must use a **defense-in-depth** approach to identify threats and secure vulnerable assets. This approach uses **multiple, redundant layers of security** at the network edge, within the network, and on network endpoints — ensuring that the failure of one safeguard does not compromise the entire architecture.

```
Internet
   │
   ▼
┌─────────────────────┐
│   EDGE ROUTER (R1)  │  ← 1st Line of Defense
│   ACL-based filter  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│      FIREWALL       │  ← 2nd Line of Defense
│  Stateful / Proxy   │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ INTERNAL ROUTER(R2) │  ← 3rd Line of Defense
│  Egress/Ingress ACL │
└─────────────────────┘
   │
   ▼
  LAN / Hosts
```

#### Defense Layer Details

| Layer | Device | Role | Key Functions |
| :---: | :--- | :--- | :--- |
| **1st** | Edge Router | Initial traffic screening | Implements ACLs to permit or deny traffic before it reaches the internal network |
| **2nd** | Firewall | Stateful checkpoint | Tracks connection states, filters traffic, provides authentication proxy services for remote users |
| **3rd** | Internal Router | Final filtering | Applies egress and ingress rules before traffic reaches the destination LAN or host |

> **Additional Devices**: Routers and firewalls are not the only components in a defense-in-depth architecture. Other key devices include Intrusion Prevention Systems (**IPS**), Advanced Malware Protection (**AMP**), web and email content security systems, identity services, and Network Access Control (**NAC**).

---

### Defensive Modeling Paradigms: Onion vs. Artichoke

For the SIO – CyberOps exam, candidates must distinguish between two primary defensive models:

#### 🧅 The Security Onion (Traditional Model)

A threat actor must **penetrate every sequential layer** of defense to reach the target data or system — peeling the network's defenses layer by layer, just like an onion. Each layer is a barrier. No layer can be skipped.

- **Strength**: Every perimeter layer must be defeated before the core is reached.
- **Limitation**: Assumes a clearly defined, static network boundary.

> ⚠️ *Note: "Security Onion" here refers to the defense-in-depth visualization concept, not the Security Onion suite of network security tools.*

#### 🌿 The Security Artichoke (Modern/Borderless Model)

With the evolution of **borderless networks**, the artichoke model better reflects today's reality. Threat actors no longer need to penetrate every layer sequentially — they only need to compromise certain **"leaves"** (e.g., mobile devices, cloud endpoints) to access sensitive data.

- Each "leaf" represents an endpoint (mobile device, remote worker, IoT device) that may independently expose sensitive data.
- Internet-facing systems may be well-hardened, but persistent attackers can find gaps in the perimeter through skill and luck.
- **Each leaf provides protection while simultaneously providing an attack path.**

| Dimension | Onion Model | Artichoke Model |
| :--- | :--- | :--- |
| **Network type** | Traditional, bounded perimeter | Borderless, distributed |
| **Attack path** | Sequential layer-by-layer | Selective leaf compromise |
| **Data exposure** | Only at the core | At every compromised leaf |
| **Threat actor advantage** | Low — must defeat all layers | High — can skip directly to leaves |
| **Modern relevance** | Legacy networks | Cloud, mobile, IoT environments |

---

## ORGANIZATIONAL SECURITY POLICIES

### Business Policy Categories

Business policies are the guidelines developed by an organization to govern its actions, defining standards of correct behavior for the business and its employees. In networking, policies define the activities that are allowed on the network — setting a **baseline of acceptable use**.

| Policy Type | Purpose |
| :--- | :--- |
| **Company Policies** | Establish rules of conduct and responsibilities of both employees and employers; protect the rights of workers and business interests |
| **Employee Policies** | Created and maintained by HR to identify salary, benefits, work schedule, attendance, dress code, privacy, and other employment terms |
| **Security Policies** | Identify security objectives, define rules of behavior for users and administrators, and specify system requirements to protect the network |

> If behavior that violates business policy is detected on the network, a security breach may have occurred.

---

### Security Policy Framework

A **comprehensive security policy** delivers multiple organizational benefits:

- Demonstrates an organization's commitment to security
- Sets the rules for expected behavior
- Ensures consistency in system operations, software/hardware acquisition, and maintenance
- Defines the **legal consequences** of violations
- Gives security staff the backing of management

Security policies inform users, staff, and managers of requirements for protecting technology and information assets. They also provide a baseline from which to **acquire, configure, and audit** computer systems and networks for compliance. A security policy is a **constantly evolving document** — updated as the threat landscape, vulnerabilities, and business requirements change.

#### Security Policy Components

| Policy | Technical Description | Functional Objective |
| :--- | :--- | :--- |
| **Identification & Authentication** | Specifies authorized entities and identity verification procedures | Controls access to network resources |
| **Acceptable Use Policy (AUP)** | Defines permitted network applications, user behaviors, and traffic types; may specify ramifications for violations | Mitigates internal misuse and sets behavioral baselines |
| **Password Policy** | Mandates minimum complexity requirements and rotation intervals | Secures authentication mechanisms |
| **Remote Access Policy** | Defines connectivity methods and accessible resources for external users | Secures perimeter-crossing traffic |
| **Network Maintenance Policy** | Standardizes OS updates and application patching procedures | Mitigates software-based vulnerabilities |
| **Incident Handling Procedures** | Outlines the procedural response to confirmed security breaches | Minimizes operational impact during an event |

> **The AUP is one of the most common security policy components.** It explicitly defines what users are allowed and not allowed to do on various system components, including the type of traffic permitted on the network. The AUP should be **as explicit as possible** to avoid misunderstanding.

---

## BYOD SECURITY IMPLEMENTATION

### Overview

**Bring Your Own Device (BYOD)** enables employees to use their own mobile devices to access company systems, software, networks, or information. BYOD increases the threat landscape by introducing **unmanaged hardware** into the corporate environment.

| BYOD Benefit | BYOD Risk |
| :--- | :--- |
| Increased employee productivity | Data breaches from unmanaged devices |
| Reduced IT and operating costs | Greater organizational liability |
| Better mobility for employees | Inconsistent security configurations |
| Greater appeal for hiring/retention | Difficulty enforcing security policies |

### BYOD Policy Requirements

A BYOD security policy should address the following:

- Specify the **goals** of the BYOD program
- Identify **which employees** can bring their own devices
- Identify **which devices** will be supported
- Define the **level of access** granted when using personal devices
- Describe **security personnel rights** to access and activities permitted on the device
- Identify **regulations** that must be adhered to when using employee devices
- Identify **safeguards** to put in place if a device is compromised

### BYOD Security Best Practices

| Best Practice | Description |
| :--- | :--- |
| **Password Protected Access** | Use unique passwords for each device and account |
| **Manually Control Wireless Connectivity** | Turn off Wi-Fi and Bluetooth when not in use; connect only to trusted networks |
| **Keep Updated** | Always maintain the device OS and software updated to mitigate the latest threats and exploits |
| **Back Up Data** | Enable device backup in case it is lost or stolen |
| **Enable "Find My Device"** | Subscribe to a device locator service with a **remote wipe** feature |
| **Provide Antivirus Software** | Provide antivirus software for all approved BYOD devices |
| **Use Mobile Device Management (MDM)** | MDM software enables IT teams to enforce security settings and software configurations on all devices connecting to company networks |

> ✅ **Exam tip**: The correct BYOD best practice is to **subscribe to a locator service with remote wipe**. Using one global password for all BYOD devices, or allowing users to choose their own antivirus, are **incorrect** practices that weaken security.

---

## VULNERABILITY IDENTIFICATION METHODOLOGY

Identifying vulnerabilities requires a comprehensive understanding of critical applications and the specific security flaws associated with both software and hardware. Cybersecurity analysts must perform technical research to determine:

- **Potential system exploit vectors** — What can be attacked and how?
- **The identity and motivation of potential threat actors** — Who would attack, and why?
- **The operational consequences of asset loss or compromise** — What is the business impact?

### Areas of Required Understanding

To identify vulnerabilities effectively, an IT security professional must have expertise in two key areas:

1. **Important applications used** — Understanding what software runs on the network and its known CVEs.
2. **Hardware used by applications** — Understanding physical and firmware-level vulnerabilities.

> ⚠️ *Exam note: "Number of systems on each network" and "data analysis trends" are distractors — they are not the primary areas required for vulnerability identification.*

---

## REGULATORY AND STANDARDS COMPLIANCE

Security professionals must operate within the legal frameworks and codes of ethics governing **Information Systems Security (INFOSEC)**. Compliance regulations define:

- The specific **liabilities and responsibilities** of an organization regarding data protection
- What organizations are **required to provide** in terms of safeguards
- The **legal consequences** of failing to comply

The compliance regulations an organization must follow depend on:
- The **type of organization** (financial institution, healthcare provider, retailer, etc.)
- The **type of data** the organization processes, stores, or transmits

> Specific compliance frameworks (e.g., PCI-DSS, HIPAA, GDPR) will be addressed in subsequent modules.

---

## EXAM QUICK-REFERENCE SUMMARY

| Question Topic | Correct Answer |
| :--- | :--- |
| First line of defense (defense-in-depth) | **Edge Router** |
| Second line of defense | **Firewall** |
| Third line of defense | **Internal Router** |
| Modern defense-in-depth vegetable analogy | **Artichoke** |
| Traditional defense-in-depth vegetable analogy | **Onion** |
| Policy defining rules of conduct for employees and employers | **Company Policy** |
| Policy defining acceptable network applications and traffic | **Acceptable Use Policy (AUP)** |
| Policy defining who can access network resources and how identity is verified | **Identification & Authentication Policy** |
| Policy enabling remote workers to access internal resources | **Remote Access Policy** |
| BYOD best practice for lost/stolen devices | **Subscribe to a locator service with remote wipe** |
| BYOD management tool for enforcing security configurations | **Mobile Device Management (MDM)** |
| BYOD benefit to organization | **Flexibility in where and how users access network resources** |
| Key areas for vulnerability identification | **Important applications used + hardware used by applications** |
| Characteristic of layered defense-in-depth | **Failure of one safeguard does NOT affect the effectiveness of others** |