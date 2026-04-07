---
title: "Transport Layer Operations and Network Reconnaissance Methodologies"
description: "A comprehensive technical analysis of Layer 4 transport protocols, session state management via the TCP three-way handshake, port classification standards, and the application of Nmap for security auditing and network discovery."
order: 9
---

# Transport Layer Operations and Network Reconnaissance Methodologies

## MODULE OVERVIEW

The transport layer, or **Layer 4 of the OSI model**, facilitates logical communication between applications running on disparate hosts. It acts as the primary interface between the application layer and the lower-level network transmission infrastructure. The fundamental responsibilities of this layer include:

- **Tracking** individual communication conversations between applications
- **Segmenting** application data into manageable units for transport
- **Reassembling** segments at the destination in the correct order
- **Multiplexing** multiple application streams over the same network simultaneously

Communication is managed through **conversation multiplexing**, which allows multiple applications to utilize the network simultaneously by interleaving segments. This module details the operational distinctions between the **Transmission Control Protocol (TCP)** and the **User Datagram Protocol (UDP)**, the mechanics of session establishment, and the methodology for auditing these services using **Nmap**.

---

## CORE CONCEPTS & DEFINITIONS

### Transmission Control Protocol (TCP)

TCP is a **connection-oriented**, **stateful** protocol designed to ensure data reliability and ordered delivery. It maintains the state of a conversation by recording which data has been transmitted and which has been acknowledged by the recipient.

| TCP Feature | Description |
| :--- | :--- |
| **Reliability** | Employs sequence numbers and acknowledgments to track every segment |
| **Flow Control** | Uses a **sliding window** mechanism to regulate transmission rate based on receiver buffer capacity |
| **Segmentation** | Divides application data into **segments** to comply with network MTU limitations |
| **Ordered Delivery** | Reassembles segments in the correct sequence at the destination |
| **Session Establishment** | Requires a **three-way handshake** before data transfer begins |
| **Session Termination** | Uses **FIN** and **ACK** flags to gracefully close connections |

**Header size:** 20 bytes minimum.

**Typical use cases:** FTP, HTTP, HTTPS, Email (SMTP, POP3, IMAP) — any application where data integrity is paramount.

---

### User Datagram Protocol (UDP)

UDP is a **connectionless**, **stateless** protocol that provides best-effort delivery with minimal overhead. Unlike TCP, it does not provide flow control, error recovery, or sequencing.

| UDP Feature | Description |
| :--- | :--- |
| **Low Latency** | No connection setup or acknowledgment overhead |
| **Best-Effort Delivery** | No guarantee that datagrams arrive or arrive in order |
| **Header Efficiency** | 8-byte header — far smaller than TCP's 20-byte header |
| **Stateless** | No session tracking; each datagram is independent |

**Typical use cases:** VoIP, DNS, DHCP, video streaming — applications requiring speed over guaranteed delivery.

---

### Port Numbers

The transport layer identifies specific applications using **port numbers**, enabling multiple services to operate simultaneously on a single host.

| Port Category | Range | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **Well-Known Ports** | 0 – 1023 | Assigned to common, standardized services | HTTP (80), SSH (22), FTP (21), DNS (53) |
| **Registered Ports** | 1024 – 49151 | Assigned by IANA for specific vendor applications | RDP (3389), MySQL (3306) |
| **Private / Dynamic Ports** | 49152 – 65535 | Ephemeral source ports dynamically assigned by the OS to client applications | Any outbound client connection |

> **Key distinction:**
> - **Destination Port** → identifies the *service* on the target host (e.g., port 80 for HTTP).
> - **Source Port** → dynamically assigned; used to route returning traffic back to the correct application on the client.

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Protocol Comparative Analysis

| Feature | TCP | UDP |
| :--- | :---: | :---: |
| **Connection Type** | Connection-Oriented | Connectionless |
| **Statefulness** | Stateful | Stateless |
| **Reliability** | Guaranteed Delivery | Best-Effort Delivery |
| **Sequencing** | Ordered Reassembly | No Sequencing |
| **Flow Control** | Sliding Window | Not Supported |
| **Error Recovery** | Retransmission of lost segments | None |
| **Header Overhead** | 20 bytes | 8 bytes |
| **Speed** | Slower (more overhead) | Faster (minimal overhead) |
| **Typical Applications** | FTP, HTTP, Email | VoIP, DNS, Video Streaming |

---

### TCP Header Fields (not present in UDP)

The following fields exist in the **TCP header** but are **absent from the UDP header**:

| TCP-Only Field | Role |
| :--- | :--- |
| **Sequence Number** | Tracks the byte position of each segment for ordered reassembly |
| **Acknowledgment Number** | Indicates the **next byte** the receiver expects; confirms receipt |
| **Window Size** | Specifies how many bytes the receiver can accept before requiring an ACK (flow control) |
| **Control Flags** | SYN, ACK, FIN, RST, PSH, URG — manage session state |

> **Exam note:** Both TCP and UDP headers include **Source Port**, **Destination Port**, **Length**, and **Checksum**. Sequence Number and Window are TCP-exclusive.

---

## OPERATIONAL ANALYSIS

### TCP Three-Way Handshake Methodology

The establishment of a TCP session requires a standardized three-step signaling process to synchronize sequence numbers and establish connection parameters **before** any application data is exchanged.

```
Client                          Server
  |                                |
  |──── SYN (Seq=0) ──────────────►|   Step 1: Client initiates
  |                                |
  |◄─── SYN-ACK (Seq=0, Ack=1) ───|   Step 2: Server responds & synchronizes
  |                                |
  |──── ACK (Seq=1, Ack=1) ───────►|   Step 3: Client confirms — session open
  |                                |
  |════ DATA EXCHANGE BEGINS ══════|
```

| Step | Flag(s) Set | Sender | Purpose |
| :---: | :--- | :--- | :--- |
| **1** | `SYN` | Client → Server | Initiates connection; sends Initial Sequence Number (ISN) |
| **2** | `SYN, ACK` | Server → Client | Acknowledges client ISN; sends server's own ISN |
| **3** | `ACK` | Client → Server | Confirms server ISN; session is now established |

#### Wireshark Lab Observation (Packet Capture Example)

From the Cisco CyberOps lab, a filtered TCP capture of a three-way handshake between `10.0.0.11` and `172.16.0.40` shows:

| Frame | Source | Destination | Flags | Seq | Ack | Notes |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | 10.0.0.11:58716 | 172.16.0.40:80 | `SYN` | 0 | — | Client initiates; source port is dynamic (private range) |
| 2 | 172.16.0.40:80 | 10.0.0.11:58716 | `SYN, ACK` | 0 | 1 | Server responds; both ISNs synchronized |
| 3 | 10.0.0.11:58716 | 172.16.0.40:80 | `ACK` | 1 | 1 | Client confirms; TCP session fully established |

> **Port classification (Frame 1):**
> - Source port `58716` → **Private/Dynamic** (client ephemeral port)
> - Destination port `80` → **Well-Known** (HTTP service)

#### Identifying the Handshake in Wireshark Packet Lists

Given a list of captured frames, the three-way handshake is always the sequence:

```
[SYN]  →  [SYN, ACK]  →  [ACK]
```

In the exam exhibit (question 11), **lines 2, 3, and 4** represent this pattern:
- Line 2: `53215 > http [SYN]`
- Line 3: `http > 53215 [SYN, ACK]`
- Line 4: `53215 > http [ACK]`

---

### TCP Session Termination

Sessions are closed using a **four-step FIN/ACK** exchange (sometimes seen in captures as FIN, ACK → ACK → FIN, ACK → ACK). The `FIN` flag signals the end of data transmission from one side.

```
Client                          Server
  |──── FIN, ACK ─────────────────►|
  |◄─── ACK ───────────────────────|
  |◄─── FIN, ACK ──────────────────|
  |──── ACK ───────────────────────►|
```

---

### TCP Sliding Window & Flow Control

The **sliding window** mechanism allows TCP to transmit multiple segments before requiring an acknowledgment, up to the limit defined by the **Window Size** field in the header.

- If the receiver's buffer is filling up, it decreases the window size to slow the sender.
- If a segment is lost, the receiver signals the source to **retransmit from a specific point forward** (selective or cumulative acknowledgment).
- The window does **not** signal the end of communication — that is the role of the `FIN` flag.

---

### TCP Server Process Characteristics

- A server can have **many ports open simultaneously**, one for each active server application.
- Each application is assigned a unique, well-known or registered port number.
- **Two different services cannot share the same port** within the same transport layer protocol on a single host.
- A single client host can maintain **multiple simultaneous TCP sessions** with the same or different servers (each identified by a unique source port).

---

### FTP Reliability Behavior

Because FTP uses TCP, if any part of a message is not delivered to the destination:

> **The specific lost part is retransmitted** — not the entire message, and not dropped silently. TCP's sequence numbers and acknowledgments identify exactly which bytes must be re-sent.

---

## NETWORK RECONNAISSANCE WITH NMAP

### What is Nmap?

**Nmap** (Network Mapper) is an open-source tool for network exploration and security auditing. It uses raw IP packets to determine:

- Which hosts are active on the network
- Which ports are open on those hosts
- Which services (and their versions) are running
- What operating systems (and OS versions) are in use
- What type of packet filters or firewalls are in place

Nmap is used both by **security professionals** for routine audits and inventory, and potentially by **threat actors** during reconnaissance attacks. Port scanning is typically one of the first phases of a network attack.

---

### Nmap Port State Taxonomy

Nmap classifies scanned ports into specific states based on the response received from the target host.

| Port State | Technical Description |
| :--- | :--- |
| **Open** | An application is actively accepting TCP connections or UDP datagrams on this port |
| **Closed** | The port is accessible (host responded) but no application is currently listening |
| **Filtered** | A firewall or packet filter is preventing Nmap from determining the port's state |
| **Open\|Filtered** | Nmap cannot distinguish between open and filtered (common with UDP) |

---

### Common Nmap Command Parameters

```bash
# Aggressive scan of a single host
nmap -A -T4 <target>

# Scan an entire subnet
nmap -A -T4 192.168.1.0/24

# UDP scan
nmap -sU <target>

# TCP SYN stealth scan (half-open)
nmap -sS <target>

# Scan a remote test server
nmap -A -T4 scanme.nmap.org
```

| Switch | Full Name | Effect |
| :--- | :--- | :--- |
| `-A` | Aggressive Mode | Enables OS detection, version detection, script scanning, and traceroute |
| `-T4` | Timing Template 4 | "Aggressive" timing — faster execution, suitable for reliable networks |
| `-sU` | UDP Scan | Identifies open UDP services |
| `-sS` | SYN Stealth Scan | Half-open TCP scan; less likely to be logged by the target |

---

### Lab Example: Scanning scanme.nmap.org

From the Cisco CyberOps Nmap lab, a scan of `scanme.nmap.org` (`45.33.32.156`) produced the following results:

| Port | State | Service | Notes |
| :--- | :--- | :--- | :--- |
| 22/tcp | Open | SSH | OpenSSH 6.6.1p1 Ubuntu |
| 25/tcp | Filtered | SMTP | Blocked by firewall |
| 80/tcp | Open | HTTP | Apache httpd 2.4.7 (Ubuntu) |
| 135/tcp | Filtered | MSRPC | Blocked by firewall |
| 139/tcp | Filtered | NetBIOS-SSN | Blocked by firewall |
| 445/tcp | Filtered | Microsoft-DS | Blocked by firewall |
| 9929/tcp | Open | Nping-echo | Nmap testing service |
| 31337/tcp | Open | tcpwrapped | — |

> The site `scanme.nmap.org` is intentionally provided by the Nmap project as a legal, authorized target for practising scans.

---

### Nmap: Security Dual-Use Considerations

| Perspective | Use |
| :--- | :--- |
| **Network Administrator** | Inventory active hosts, detect rogue devices, verify firewall rules, audit open ports |
| **Security Analyst** | Identify vulnerabilities before attackers do; baseline normal network state |
| **Threat Actor** | Reconnaissance phase of an attack — discover targets, open services, and OS fingerprints |

> ⚠️ **Always obtain explicit written permission** from network owners before running Nmap scans. Unauthorized scanning may be illegal.

---

## CASE STUDIES & EXAM SPECIFICS

### Protocol Selection Criteria

In CyberOps environments, identifying the correct transport protocol is critical for traffic analysis and exam questions:

| Protocol | Choose When... | Example Applications |
| :--- | :--- | :--- |
| **UDP** | Speed and low overhead matter more than guaranteed delivery | VoIP, DNS, DHCP, video streaming |
| **TCP** | Data integrity and ordered delivery are mandatory | FTP, HTTP, HTTPS, POP3, SMTP |

---

### Key TCP Header Fields — Exam Quick Reference

| Field | Size | Meaning |
| :--- | :---: | :--- |
| **Source Port** | 16 bits | Dynamically assigned client port (identifies the sending application) |
| **Destination Port** | 16 bits | Identifies the target service on the server |
| **Sequence Number** | 32 bits | Byte position of the first byte in this segment |
| **Acknowledgment Number** | 32 bits | **Next byte** the receiver expects to receive |
| **Window Size** | 16 bits | Number of bytes receiver can accept before an ACK is required |
| **Control Flags** | 6 bits | SYN, ACK, FIN, RST, PSH, URG |
| **Checksum** | 16 bits | Error-checking field (present in both TCP and UDP) |

---

### TCP Flags Reference

| Flag | Name | Purpose |
| :---: | :--- | :--- |
| `SYN` | Synchronize | Initiates a connection; used in handshake steps 1 and 2 |
| `ACK` | Acknowledge | Confirms receipt of data; used in all handshake steps 2 and 3 |
| `FIN` | Finish | Signals graceful end of a connection |
| `RST` | Reset | Abruptly terminates a connection or rejects an invalid request |
| `PSH` | Push | Instructs receiver to pass data to the application immediately |
| `URG` | Urgent | Indicates urgent data that should be prioritized |

> **Exam tip:** The TCP three-way handshake uses only **SYN** and **ACK** flags. The two flags used to *establish* connectivity are **SYN** and **ACK**.

---

### Port Classification Standards — Quick Reference

| Range | Category | Examples |
| :--- | :--- | :--- |
| 0 – 1023 | Well-Known Ports | HTTP (80), HTTPS (443), FTP (21), SSH (22), DNS (53), SMTP (25) |
| 1024 – 49151 | Registered Ports | RDP (3389), MySQL (3306) |
| 49152 – 65535 | Private / Dynamic | Client ephemeral ports (source ports for outbound connections) |

---

### Useful Wireshark Filters for Network Administrators

| Filter | Purpose |
| :--- | :--- |
| `tcp` | Display only TCP traffic |
| `udp` | Display only UDP traffic |
| `http` | Display only HTTP traffic |
| `ip.addr == 192.168.1.1` | Show traffic to/from a specific IP |
| `tcp.flags.syn == 1` | Isolate TCP SYN packets (connection initiations) |
| `tcp.flags.fin == 1` | Isolate TCP FIN packets (session terminations) |
| `dns` | Display only DNS queries and responses |

---

## SUMMARY

```
┌──────────────────────────────────────────────────────┐
│              TRANSPORT LAYER AT A GLANCE              │
├───────────────────────┬──────────────────────────────┤
│          TCP          │            UDP               │
├───────────────────────┼──────────────────────────────┤
│ Connection-Oriented   │ Connectionless               │
│ 3-Way Handshake       │ No handshake                 │
│ Reliable / Ordered    │ Best-Effort                  │
│ Sliding Window        │ No flow control              │
│ 20-byte header        │ 8-byte header                │
│ FTP, HTTP, Email      │ VoIP, DNS, Streaming         │
└───────────────────────┴──────────────────────────────┘

Transport Layer Key Functions:
  ✔ Identify applications via port numbers
  ✔ Track individual communication sessions
  ✔ Segment / reassemble data
  ✔ Provide interface between apps and network (TCP/UDP)

Nmap Port States:  Open | Closed | Filtered
Handshake Flags:   SYN → SYN-ACK → ACK
Session End Flags: FIN, ACK → ACK → FIN, ACK → ACK
```