---
title: "Intrusion Detection Systems & Security Onion Architecture"
description: "Complete study guide for the CyberOps Associate certification — covering Security Onion components, alert classification, deterministic vs probabilistic analysis, Snort rules, and iptables firewall configuration."
order: 26
---

# Intrusion Detection Systems & Security Onion Architecture


---

## 1. Security Onion — Platform Overview

**Security Onion** is a Linux distribution designed for **Network Security Monitoring (NSM)**. It provides an integrated platform offering full telemetry visibility across network infrastructure through three core operational functions:

| Function | Description |
| :--- | :--- |
| **Data Capture** | Full Packet Capture (PCAP) + session metadata generation |
| **Intrusion Detection** | Network sensors (NIDS) and host-based agents (HIDS) |
| **Alert Analysis Tools** | Dashboards and workflow interfaces for analyst correlation |

The platform centralizes detection to reduce Mean Time To Respond (MTTR) and supports post-mortem analysis via raw PCAP data.

---

## 2. Security Onion — Integrated Tools (Exam Critical)

### 2.1 Network Intrusion Detection Systems (NIDS)

| Tool | Key Characteristic | Exam Tip |
| :--- | :--- | :--- |
| **Snort** | Signature-based detection; uses strict rule syntax to inspect packet headers and payloads; **single-threaded** architecture | Generates network intrusion alerts via rules and signatures |
| **Suricata** | Signature-based + **native multithreading** for high-throughput streams; supports protocol identification and file extraction in real-time | The only NIDS with native multithread support |
| **Zeek** *(formerly Bro)* | Network analysis framework generating rich metadata logs (HTTP, DNS, SSL certificates) without requiring full packet capture for each analysis | Metadata-focused; not a traditional alert engine |

> ⚠️ **Exam trap:** Zeek (formerly Bro) is sometimes listed as "Bro" in older questions. They are the same tool.

### 2.2 Host-Based Intrusion Detection Systems (HIDS)

| Tool | Description |
| :--- | :--- |
| **OSSEC** | Open-source HIDS integrated into Security Onion; performs log analysis, file integrity monitoring (FIM), rootkit detection, and policy monitoring |
| **Wazuh** | Modern HIDS integrated into Security Onion; evolution of OSSEC with enhanced features |

> ✅ **Exam answer:** Both OSSEC and Wazuh are valid answers for "host-based IDS in Security Onion."

### 2.3 Analysis & Management Tools

| Tool | Primary Function | Exam Tip |
| :--- | :--- | :--- |
| **Sguil** | Main alert management console; used to **initiate workflow investigations**, pivot to packet transcripts, and classify events | **Starting point for analyst investigations** |
| **Kibana** | **Interactive dashboard interface** to **Elasticsearch** data; used for visualization and querying of large normalized datasets | Answer for "interactive dashboard to Elasticsearch" |
| **PulledPork** | Automated signature management utility for Snort; **automatically downloads new rules** | Answer for "tool used by Snort to auto-download rules" |
| **Wireshark** | Packet analysis GUI tool; used to display full-packet captures for analysis | Useful but not an alert workflow tool |

---

## 3. Alert Classification Matrix (Exam Critical)

Precise alert classification is essential for SOC efficiency. It quantifies the accuracy of detection systems.

| Classification | Incident Reported? | Incident Occurred? | Description | Operational Response |
| :--- | :---: | :---: | :--- | :--- |
| **True Positive (TP)** | ✅ Yes | ✅ Yes | IDS **correctly identifies** malicious activity / a confirmed exploit | Trigger incident response protocol |
| **True Negative (TN)** | ❌ No | ❌ No | Benign traffic that the IDS **correctly ignores** | No action (nominal state) |
| **False Positive (FP)** | ✅ Yes | ❌ No | Legitimate traffic **incorrectly flagged** as a threat | Tune/adjust IDS signatures |
| **False Negative (FN)** | ❌ No | ✅ Yes | A real intrusion **not detected** by the system — exploits go undetected | Critical security failure; rules review required |

### Quick MCQ Reference

| Question | Answer |
| :--- | :--- |
| No alert, no incident | **True Negative** |
| Alert correctly identifies an exploit | **True Positive** |
| Exploits are NOT being detected by security systems | **False Negative** |
| Alert raised but no incident actually occurred | **False Positive** |

---

## 4. Analysis Methodology — Deterministic vs. Probabilistic

| Attribute | **Deterministic Analysis** | **Probabilistic Analysis** |
| :--- | :--- | :--- |
| **Logic Basis** | Predefined conditions and fixed signatures | Statistical modeling and probability scoring |
| **Application** | Standardized protocols on **well-known fixed ports** (e.g., TCP/80, TCP/443) | Anomalous behaviors and dynamic/ephemeral ports |
| **Reliability** | Binary result (Match / No Match) | Confidence score based on historical baseline |
| **Limitation** | Ineffective against Zero-day threats | Higher risk of false positives |

> ✅ **Exam answer:** *"Relies on predefined conditions and can analyze applications using well-known fixed ports"* → **Deterministic**
>
> ✅ **Exam answer:** *"Relies on different methods to establish the likelihood that a security event occurred"* → **Probabilistic**

---

## 5. Snort Rule Anatomy

Snort's effectiveness relies on its rule structure. Each rule has a **rule header** and **rule options**.

### Rule Syntax

```
action protocol src_ip src_port direction dst_ip dst_port (options)
```

### Example — Nimda Worm Detection

alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS 80 \
  (msg:"MALWARE-CNC Win.Trojan.Nimda.A"; content:"GET /admin.dll"; sid:1000001; rev:1;)
  
### Component Breakdown

| Component | Value | Description |
| :--- | :--- | :--- |
| **Action** | `alert` | Generate an alert and log the event |
| **Protocol** | `tcp` | Transport-layer protocol to inspect |
| **Source** | `$EXTERNAL_NET any` | Network variable + any source port |
| **Direction** | `->` | Unidirectional (source to destination) |
| **Destination** | `$HTTP_SERVERS 80` | Network variable + destination port |
| **msg** | `"Malicious Server Hit!"` | Human-readable alert message |
| **content** | `"GET /admin.dll"` | Payload string to match |
| **sid** | `1000001` | Unique Snort rule ID |
| **rev** | `1` | Rule revision number |

### Snort in Security Onion

> **Snort's function in Security Onion:** To **generate network intrusion alerts by the use of rules and signatures**.

Snort monitors traffic transiting the network device. When a packet payload matches a configured signature (e.g., a download of a known malware binary), it writes an alert entry to `/var/log/snort/alert`.

**Sample Snort Alert Entry:**
```
04/28-17:00:04.092153 [**] [1:1000003:0] Malicious Server Hit! [**] [Priority: 0]
{TCP} 209.165.200.235:34484 -> 209.165.202.133:6666
```

| Field | Value |
| :--- | :--- |
| Timestamp | `04/28-17:00:04.092153` |
| Signature ID | `1:1000003:0` |
| Alert Message | `Malicious Server Hit!` |
| Source IP:Port | `209.165.200.235:34484` |
| Destination IP:Port | `209.165.202.133:6666` |

---

## 6. Firewall Response — iptables

Once a **True Positive** is confirmed by the analyst, containment measures must be applied at the firewall level. In the CyberOps environment, this is done via **iptables** on the router/firewall device (R1).

### iptables Chain Logic

| Chain | Handles Traffic... | Example |
| :--- | :--- | :--- |
| **INPUT** | Arriving at the firewall device itself | Incoming pings to R1's interface |
| **OUTPUT** | Originating from the firewall device | Ping replies generated by R1 |
| **FORWARD** | Passing *through* the firewall to another host | Traffic being routed by R1 between networks |

> ✅ Traffic between internal users and an external malicious server passes **through** R1 → use the **FORWARD** chain.

### Blocking a Malicious Server

```bash
# Block TCP traffic destined for the malicious server on port 6666
iptables -I FORWARD -p tcp -d 209.165.202.133 --dport 6666 -j DROP
```

| Flag | Meaning |
| :--- | :--- |
| `-I FORWARD` | Insert rule at the top of the FORWARD chain |
| `-p tcp` | Match TCP protocol |
| `-d 209.165.202.133` | Match destination IP |
| `--dport 6666` | Match destination port 6666 |
| `-j DROP` | Action: silently drop the packet |

### Verifying the Rule

```bash
iptables -L -v
```

Expected output confirms the DROP rule in the FORWARD chain:
```
Chain FORWARD (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target  prot opt  source    destination
    0     0 DROP    tcp  --   any       209.165.202.133  tcp dpt:6666
```

### More Aggressive Alternative

To block **all** traffic to/from the offending server (not just TCP/6666):

```bash
iptables -I FORWARD -d 209.165.202.133 -j DROP   # Block all outbound to attacker
iptables -I FORWARD -s 209.165.202.133 -j DROP   # Block all inbound from attacker
```

---

## 7. Lab Case Study — W32.Nimda Worm

This scenario walks through the full analyst workflow from alert to remediation.

### Scenario Summary

- **H10** simulates an internet-based malicious server running nginx on **TCP port 6666**
- **H5** (internal user) downloads `W32.Nimda.Amm.exe` from `209.165.202.133:6666`
- **Snort** on **R1** detects the payload and writes an alert
- Analyst uses **Sguil** to review the alert and pivot to PCAP data
- Analyst applies an **iptables DROP rule** on R1 to block further connections

### Analyst Workflow

```
[Alert Generated by Snort]
        |
        v
[Sguil — Initiate Investigation / Classify Alert]
        |
        v
[Wireshark / tcpdump — Examine PCAP for confirmation]
        |
        v
[True Positive confirmed]
        |
        v
[iptables — Apply DROP rule on FORWARD chain]
        |
        v
[Verify — Retry wget fails with "Connection timed out"]
```

### PCAP Utility for Analysts

The captured `.pcap` file (`nimda.download.pcap`) allows the analyst to:
- Reconstruct the full TCP session
- Inspect HTTP request/response headers
- Extract the malware binary from the stream
- Confirm exact timestamps and data transferred
- Use in other labs for deeper malware analysis

---

## 8. Three Analysis Tools Integrated into Security Onion

*(MCQ asks to "Choose three")*

The three primary **analysis tools** in Security Onion are:

1. **Sguil** — Alert management and workflow initiation
2. **Kibana** — Elasticsearch dashboard and data visualization
3. **Wireshark** — Full-packet capture display and analysis

> ⚠️ Snort and Suricata are **detection engines**, not analysis tools. OSSEC/Wazuh are **HIDS** agents.

---

## 9. Complete MCQ Answer Key

| Question | Correct Answer | Rationale |
| :--- | :--- | :--- |
| No alert reported, no incident occurred | **True Negative** | System correctly silent on benign traffic |
| Alert correctly identifies an exploit | **True Positive** | Correct detection of real malicious activity |
| Analysis using predefined conditions + well-known fixed ports | **Deterministic** | Binary match logic on known ports |
| Tool used by Snort to auto-download rules | **PulledPork** | Automated rule update utility |
| Interactive dashboard interface to Elasticsearch | **Kibana** | Visualization layer for Elasticsearch |
| Analysis based on likelihood of a security event | **Probabilistic** | Statistical/behavioral approach |
| NIDS using signatures AND native multithreading | **Suricata** | Only Suricata natively multithreads |
| Host-based IDS integrated into Security Onion | **OSSEC** | Primary HIDS agent (Wazuh also valid) |
| Three analysis tools in Security Onion | **Sguil, Kibana, Wireshark** | Core analyst-facing tools |
| Snort's function in Security Onion | **Generate network intrusion alerts via rules/signatures** | Core IDS role |
| HIDS tool integrated into Security Onion | **Wazuh** | Modern replacement/evolution of OSSEC |
| Tool to start a workflow investigation | **Sguil** | Primary analyst console |
| Alert class indicating exploits go undetected | **False Negative** | Missed detection = critical gap |

---

## 10. Key Relationships Summary

```
Security Onion
├── NIDS
│   ├── Snort          → Signature-based, single-threaded, uses PulledPork for rule updates
│   └── Suricata       → Signature-based + native multithreading
├── HIDS
│   ├── OSSEC          → Log analysis, FIM, rootkit detection
│   └── Wazuh          → Enhanced OSSEC successor
├── Analysis Tools
│   ├── Sguil          → Alert console, workflow initiation, PCAP pivot
│   ├── Kibana         → Elasticsearch dashboard
│   └── Wireshark      → Full-packet capture display
└── Support Tools
    ├── Zeek (Bro)     → Network metadata logging
    └── PulledPork     → Automated Snort rule download
```