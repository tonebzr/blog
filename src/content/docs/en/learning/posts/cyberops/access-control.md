---
title: "Information Security Frameworks, Access Control Models, and AAA Operations"
description: "A technical examination of the CIA triad, Zero Trust architecture, diverse access control methodologies, and the operational implementation of AAA protocols within enterprise network environments."
order: 19
---


## 1. The CIA Triad

Information security deals with protecting information and information systems from **unauthorized access, use, disclosure, disruption, modification, or destruction**.

The CIA triad is the cornerstone model of information security, composed of three fundamental properties:

```
        Confidentiality
              △
             / \
            /   \
           /     \
    Integrity ——— Availability
```

| Property | Definition | Example |
|---|---|---|
| **Confidentiality** | Only authorized individuals, entities, or processes can access sensitive information | Encrypting files or VoIP calls so eavesdroppers cannot read them |
| **Integrity** | Protection of data from unauthorized alteration | Hashing a file to detect tampering |
| **Availability** | Authorized users must have uninterrupted access to the network resources and data they require | Load balancing web servers to prevent downtime |

> **Exam tip:** Implementing load balancing and redundancy across multiple web servers addresses the **Availability** requirement of the CIA triad.

Cryptography is a primary tool to enforce **confidentiality** — the trend is toward encrypting all communication.

---

## 2. Zero Trust Security

### Core Principle

> *"Never trust, always verify."*

Zero trust is a comprehensive approach to securing **all access** across networks, applications, and environments. It covers users, end-user devices, APIs, IoT, microservices, containers, and more.

**Key idea:** In a traditional model, the network perimeter was the trust boundary (inside = trusted, outside = untrusted). In Zero Trust, **every access control decision point is considered a perimeter** — a previously authenticated user must re-authenticate to access a new resource or layer.

### The Three Pillars of Zero Trust

| Pillar | Scope | Focus |
|---|---|---|
| **Workforce** | Employees, contractors, partners, vendors | Ensures only the right users and secure devices can access applications, regardless of location |
| **Workloads** | Cloud apps, data centers, virtualized environments | Secure access between APIs, microservices, and containers interacting with databases |
| **Workplace** | All network-connected devices (IoT, endpoints, servers, printers, cameras, HVAC, etc.) | Secure access for every device on the enterprise network |

### Benefits of Zero Trust

- Prevents unauthorized access
- Contains breaches
- Reduces the risk of **lateral movement** by attackers within the network

---

## 3. Access Control Models

An organization must implement proper access controls to protect its network resources, information system resources, and information. Understanding these models also helps security analysts identify how attackers may attempt to break them.

| Model | Full Name | Key Characteristics | Typical Use Case |
|---|---|---|---|
| **DAC** | Discretionary Access Control | Least restrictive. Data **owners** control access to their own data. May use ACLs or other methods. | Commercial environments, file systems |
| **MAC** | Mandatory Access Control | Strictest model. Security labels are assigned to information; users are granted access based on their **security clearance level**. | Military, mission-critical applications |
| **RBAC** | Role-Based Access Control | Access decisions based on the user's **role and responsibilities** within the organization. Also considered a type of non-discretionary access control. | Enterprises with defined job roles |
| **ABAC** | Attribute-Based Access Control | Access based on **attributes** of the object (resource), the subject (user), and **environmental factors** (e.g., time of day). Most flexible model. | Dynamic, fine-grained access policies |
| **Rule-Based AC** | Rule-Based Access Control | Network staff define **rules/conditions** associated with access (e.g., permitted IP addresses, protocols). Also called Rule-Based RBAC. | Firewalls, network ACLs |
| **TAC** | Time-Based Access Control | Grants access to network resources based on **time and day**. | Scheduled access, shift-based environments |

### Model Comparison at a Glance

```
Restrictiveness (Low → High):
DAC  ──────────  RBAC / ABAC / Rule  ──────────  MAC
(owner decides)    (policy decides)         (system enforces strictly)
```

---

## 4. Principle of Least Privilege & Privilege Escalation

### Principle of Least Privilege

> Users and processes should be granted **the minimum amount of access required** to perform their work function — nothing more.

- Also described as a **limited, as-needed** approach to granting rights
- Applies to both **user accounts** and **software processes**

### Privilege Escalation

A **privilege escalation** attack exploits vulnerabilities in servers or access control systems to grant an unauthorized user (or software process) **higher levels of privilege** than they should have.

After escalation, the threat actor can:
- Access sensitive information
- Take control of a system

> **Example of privilege escalation:** A threat actor exploits a vulnerability in an application to gain administrator-level access, even though they are authenticated only as a regular user.

> **Counter-example (NOT privilege escalation):** A DDoS attack crashing a server — this is a denial-of-service, not privilege escalation. A port scan finding an open FTP service is reconnaissance, not escalation.

---

## 5. AAA Framework

### Overview

A network must control **who** is allowed to connect and **what** they are allowed to do. These requirements are defined in the **network security policy**. The **Authentication, Authorization, and Accounting (AAA)** protocol provides the framework to enable scalable access security.

The three independent components of AAA:

| Component | Question Answered | Description | Example |
|---|---|---|---|
| **Authentication** | *Who are you?* | Verifies the identity of users and administrators via credentials, tokens, challenge/response, etc. Provides centralized access control. | Username + password login |
| **Authorization** | *What can you do?* | Determines which resources the user can access and which operations they can perform — **after** authentication. | "User 'student' can access host server XYZ using SSH only." |
| **Accounting** | *What did you do?* | Records what the user accessed, for how long, and any changes made. Supports compliance logging. | "User 'student' accessed host server XYZ using SSH for 15 minutes." |

> **Analogy:** Think of a credit card — it identifies who can use it (authentication), defines a spending limit (authorization), and produces a statement of purchases (accounting).

### AAA Log Entry Example

```
User student accessed host server ABC using Telnet yesterday for 10 minutes.
```
This is an **Accounting** log entry — it records the user, resource, method, and duration.

---

## 6. AAA Authentication Methods

Cisco provides two common methods of implementing AAA services:

### Local AAA Authentication

- Also called **self-contained authentication**
- Authenticates users against **locally stored** usernames and passwords
- Ideal for **small networks**
- **Limitation:** Does not scale well — managing credentials on each device individually becomes impractical as the network grows

```
Remote Client → [AAA Router (local DB)] → Corporate Network
       1. Client connects
       2. Router prompts for credentials
       3. Router checks local database → grants/denies access
```

### Server-Based AAA Authentication

- Uses a **centralized AAA server**
- Preferred for larger, enterprise environments — **more scalable and manageable**
- Supports **Active Directory** or **LDAP** for user authentication and group membership
- Devices communicate with the server using **RADIUS** or **TACACS+** protocols
- Enables full accounting capabilities

```
Remote Client → [AAA Client/Router] → [Centralized AAA Server (RADIUS/TACACS+)]
                                              ↕
                                    [Active Directory / LDAP]
```

---

## 7. TACACS+ vs RADIUS

Both are server-based AAA protocols, but they differ significantly:

| Feature | TACACS+ | RADIUS |
|---|---|---|
| **Standard** | Mostly Cisco proprietary | Open / RFC standard |
| **Transport** | TCP port **49** | UDP ports **1812/1813** or **1645/1646** |
| **AAA Functions** | Separates Authentication, Authorization, and Accounting (full modularity) | Combines Authentication and Authorization; separates Accounting |
| **Confidentiality** | Encrypts the **entire body** of the packet (only the header is unencrypted) | Encrypts **only the password** in the access-request packet |
| **Protocol** | Bidirectional challenge/response (CHAP) | Unidirectional challenge/response from server to client |
| **Customization** | Authorizes router commands on a **per-user or per-group** basis | No per-user/per-group command authorization |
| **Accounting** | Limited | Extensive |
| **Best for** | Network device administration, granular control | Network access (VPN, Wi-Fi, dial-in) |

> **Key takeaway:** Use **TACACS+** when you need fine-grained command authorization on network devices. Use **RADIUS** for broad, standard-compliant network access authentication.

---

## 8. AAA Accounting Types

AAA accounting collects and reports usage data in AAA logs. The following types of accounting information can be collected:

| Accounting Type | What It Captures |
|---|---|
| **Network Accounting** | All PPP sessions — packet and byte counts |
| **Connection Accounting** | All outbound connections from the AAA client (e.g., SSH sessions) |
| **EXEC Accounting** | User EXEC terminal sessions (shells) — username, date, start/stop times, server IP |
| **System Accounting** | System-level events (e.g., reboots, accounting turned on/off) |
| **Command Accounting** | EXEC shell commands for a specified privilege level, with timestamp and user |
| **Resource Accounting** | Start/stop records for connections that passed (or failed) user authentication |

---

## 9. Key Concepts – Quick Reference

| Concept | Summary |
|---|---|
| CIA Triad | Confidentiality, Integrity, Availability |
| Zero Trust | "Never trust, always verify" — every point is a perimeter |
| DAC | Owner controls access — least restrictive |
| MAC | System enforces labels — most restrictive, military use |
| RBAC | Access by role/job function |
| ABAC | Access by object/user/environment attributes (most flexible) |
| Least Privilege | Grant only the minimum access needed |
| Privilege Escalation | Exploiting vulnerabilities to gain higher access than authorized |
| AAA | Authentication + Authorization + Accounting |
| Local AAA | Credentials stored on device — does not scale well |
| Server AAA | Centralized, scalable — uses RADIUS or TACACS+ |
| TACACS+ | TCP/49, fully separates AAA, encrypts full packet, Cisco-focused |
| RADIUS | UDP/1812-1813, open standard, combines authn/authz, encrypts only password |

---