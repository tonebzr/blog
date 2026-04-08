---
title: "Network Security Infrastructure and Endpoint Monitoring"
description: "A high-level technical analysis of network security topologies, traffic monitoring methodologies, SIEM/SOAR integration."
order: 15
---

## MODULE OVERVIEW

The current landscape of cybersecurity is defined by the principle that **all networks are potential targets**, necessitating a robust, **defense-in-depth** strategy. A comprehensive security infrastructure must integrate multiple layers of protection, including **firewalls**, **Intrusion Detection Systems (IDS)**, **Intrusion Prevention Systems (IPS)**, and **endpoint security software**. These technologies facilitate automated monitoring and alert generation; however, large-scale environments require human intervention to evaluate **false positives**—legitimate traffic erroneously flagged as unauthorized.

The primary responsibility of a **Cybersecurity Analyst** is to validate these alerts and determine the integrity of internal assets. Typical daily questions include:
- Was the file downloaded by a user actually malware?
- Is the website visited by a user genuinely malicious?
- Is an internal device (e.g., a printer) trying to reach an unauthorized external server?

---

## CORE CONCEPTS & DEFINITIONS

### Network Security Topology

A **defense-in-depth** approach layers multiple security controls so that if one fails, others remain in place. The following components form the backbone of a modern security infrastructure:

| Component | Role |
| :--- | :--- |
| **Firewall** | Filters traffic based on pre-configured rules (stateful/stateless) |
| **IDS** | Detects and alerts on suspicious traffic patterns passively |
| **IPS** | Detects and actively blocks malicious traffic inline |
| **Endpoint Security** | Protects individual hosts from malware, exploits, and unauthorized access |
| **SIEM / SOAR** | Centralizes log collection, correlation, alerting, and automated response |

### Network Monitoring Methodologies

To establish a baseline of normal network behavior, analysts utilize several protocols and tools to monitor traffic flow, bandwidth, and resource access. Abnormal behavior deviating from this baseline typically indicates a security incident or misconfiguration.

* **SNMP (Simple Network Management Protocol)**: Allows analysts to request and receive operational information from network devices.
* **NetFlow**: A Cisco-developed protocol used for network planning, security monitoring, and traffic analysis.
* **Packet Analyzers**: Tools like **Wireshark** capture frames into files containing detailed frame information, interface data, timestamps, and packet lengths.
* **Tcpdump**: A command-line utility providing extensive options for capturing and filtering network packets.

> **Quick Reference — Tool Selection:**
> | Question | Correct Tool |
> | :--- | :--- |
> | Request/receive device operational info | **SNMP** |
> | Capture frames with timestamps & lengths | **Wireshark** |
> | Network planning & traffic analysis | **NetFlow** |
> | Real-time enterprise security reporting | **SIEM** |
> | Command-line packet capture | **Tcpdump** |

### Endpoint Auditing

Endpoints must be monitored for open ports that may allow unauthorized remote connections. Vulnerabilities or malware infections can result in processes listening for incoming commands.

* **TCPView**: A Windows-based utility (Sysinternals) that provides a real-time, detailed subset of the functionality found in **Netstat**. It displays all **TCP** and **UDP** endpoints, including local/remote addresses and connection states.
* **Netstat**: Cross-platform command-line tool for displaying active connections, routing tables, and network statistics.

> **Lab Activity — "What's Going On?" (15.0.3)**
> The Cisco CyberOps class activity uses TCPView to:
> 1. Identify all running processes and their associated protocols
> 2. Observe **LISTENING** vs. **ESTABLISHED** connections in real time
> 3. Monitor connection changes when a browser opens and navigates to a website
> 4. Understand TCPView color coding (new connections highlighted, closed connections in red)
> 5. Terminate a suspicious process via right-click > **End Process** (use with caution — may cause instability)

---

## TECHNICAL TAXONOMY & CLASSIFICATION

The following tables categorize data capture methods and security management systems based on their operational characteristics and technical implementation.

### Table 1: Hardware and Logical Traffic Capture

| Method | Technical Implementation | Operational Impact | Fail-Safe |
| :--- | :--- | :--- | :--- |
| **Network TAP** | A passive splitting device installed inline between two devices (e.g., firewall and router). Sends TX and RX streams to a monitoring device on dedicated channels. | Forwards all traffic (including physical layer errors) to an analysis device in real time without degrading performance. | Yes — traffic continues if TAP loses power |
| **Traffic Mirroring (SPAN)** | A switch-based technique where frames are copied from source ports or VLANs to a destination port. | Enables monitoring in segmented environments but may be limited by switch processing capacity. | No dedicated fail-safe |
| **Remote SPAN (RSPAN)** | An extension of SPAN that leverages VLANs to monitor traffic on remote switches across the network. | Extends visibility beyond local switches; requires VLAN infrastructure. | Depends on VLAN availability |

### Table 2: SPAN Terminology

| Term | Description |
| :--- | :--- |
| **Ingress traffic** | Traffic entering the switch on a source SPAN port |
| **Egress traffic** | Traffic leaving the switch on a source SPAN port |
| **Source port** | A port monitored for traffic analysis |
| **Destination port** | The SPAN port connected to the analysis device (IDS, management server) |
| **SPAN session** | The association between one or more source ports and a destination port |

> **Note:** Each SPAN session can use ports **or** VLANs as sources, but not both simultaneously. On some Cisco switches, traffic can be mirrored to more than one destination port.

### Table 3: SIEM vs. SOAR Functionality

| System | Primary Role | Core Functions | Key Differentiator |
| :--- | :--- | :--- | :--- |
| **SIEM** | Real-time reporting and long-term analysis of security events | Forensic analysis, correlation of disparate logs, aggregation of duplicate records, reporting | Sounds the alarm — **detects** threats |
| **SOAR** | Enhances SIEM by facilitating incident response and investigation | Case management, threat intelligence integration, automation of response via **run books** | Enables response — **acts** on threats |

---

## OPERATIONAL ANALYSIS

### Analyzing Traffic with the ELK Stack

The **ELK** suite (Elasticsearch, Logstash, Kibana) is an open-source SIEM solution integrated into platforms like **Security Onion**. It is commonly used in CyberOps training environments as an accessible alternative to proprietary tools like Splunk or SolarWinds.

* **Logstash**: Operates as a pipeline processing system that connects data inputs to outputs, applying optional filters during transit.
* **Elasticsearch**: Serves as a document-oriented, full-text search engine for indexing security data.
* **Kibana**: Provides a browser-based dashboard for visualizing and searching data indexed by Elasticsearch.

```
[Inputs] --> Logstash (filters) --> Elasticsearch (index) --> Kibana (visualize)
         e.g., syslog, NetFlow,                               dashboards, alerts
               firewall logs
```

### Commercial SIEM Platforms

| Platform | Type | Notable Features |
| :--- | :--- | :--- |
| **Splunk Enterprise Security** | Proprietary | Industry-standard, powerful SPL query language, broad integrations |
| **SolarWinds Security Event Manager** | Proprietary | Affordable, built-in compliance reporting |
| **Security Onion + ELK** | Open Source | Free, used in Cisco CyberOps training, integrates Zeek, Suricata, and ELK |

### Endpoint Connection States

In a typical analysis using **TCPView** or **Netstat**, the following states and attributes must be identified to ensure security compliance:

1. **LISTENING**: The process is waiting for an incoming connection on a local port — a key indicator of potential malware backdoors.
2. **ESTABLISHED**: An active end-to-end connection is currently in place between the local and remote host.
3. **TIME_WAIT**: The connection is closing; the local side is waiting to ensure the remote side received the termination.
4. **CLOSE_WAIT**: The remote side has closed the connection, waiting for the local process to close.
5. **Process Identification**: Every connection is mapped to a specific **Process ID (PID)** and executable (e.g., `lsass.exe`, `svchost.exe`).
6. **Protocol Versioning**: Monitoring should include both **TCP** and **TCPv6** endpoints to ensure no hidden communication channels exist.

---

## CASE STUDIES & EXAM SPECIFICS

### Scenario: Identifying Malicious Persistence

A cybersecurity analyst observes an unknown process in **TCPView** with a state of **LISTENING** on a high-numbered port. According to the Cisco CyberOps framework, attackers require a listening port to establish a remote connection. If this port was opened by a process not authorized by the organization's security policy, it may indicate a malware infection or a software vulnerability. Analysts can use **TCPView** to terminate the process directly via **End Process**, though this carries the risk of system instability — only known-safe processes should be ended this way.

**Investigation workflow:**
1. Identify the suspicious PID in TCPView
2. Cross-reference the PID with **Task Manager** or `tasklist` to find the parent executable
3. Check the executable path — malware often resides in `%TEMP%` or `%APPDATA%`
4. Search the hash of the executable on **VirusTotal** or a similar threat intelligence platform
5. If confirmed malicious: isolate the endpoint, terminate the process, and escalate to the SOC

### Scenario: SPAN Session on a Cisco Switch

```
! Example: Mirror traffic from F0/1 and F0/2 to G0/1 (IDS sensor)
Switch(config)# monitor session 1 source interface F0/1 both
Switch(config)# monitor session 1 source interface F0/2 both
Switch(config)# monitor session 1 destination interface G0/1
```

### Exam Differentiators

* **SPAN vs. RSPAN**: While **SPAN** monitors ports on a local switch, **Remote SPAN (RSPAN)** allows administrators to monitor traffic on remote switches using VLANs.
* **TAPs and Fail-Safe**: Network TAPs are designed to be fail-safe; if power is lost, traffic continues to flow between the primary network devices (e.g., the firewall and router) unaffected.
* **Data Aggregation**: SIEM systems utilize **aggregation** specifically to reduce the volume of event data by consolidating duplicate records — critical for managing millions of events in enterprise environments.
* **SIEM vs. SOAR**: SIEM **detects and reports**; SOAR **automates the response**. Both are complementary, not interchangeable.
* **TCPView vs. Netstat**: TCPView is GUI-based, real-time, and Windows-only; Netstat is command-line and cross-platform.
* **IDS vs. IPS**: IDS is **passive** (alerts only); IPS is **inline and active** (can block traffic).

---

## PRACTICE QUESTIONS

The following questions reflect the style of the Cisco CyberOps certification exam for this module:

1. **What allows analysts to request and receive information about the operation of network devices?**
   > Answer: **SNMP**

2. **What application captures frames saved in a file containing frame info, interface info, packet length, and timestamps?**
   > Answer: **Wireshark**

3. **Which tool can be used for network and security monitoring, network planning, and traffic analysis?**
   > Answer: **NetFlow**

4. **Which tool is used in enterprise organizations to provide real-time reporting and long-term analysis of security events?**
   > Answer: **SIEM**

5. **Which utility provides numerous command-line options for capturing packets?**
   > Answer: **Tcpdump**

---

> **Discussion Prompt:** How would you differentiate the use cases for a passive Network TAP versus a logical SPAN session in a high-bandwidth data center environment? Consider performance impact, visibility scope, and fail-safe behavior in your answer.