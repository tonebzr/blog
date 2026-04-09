---
title: "TCP/IP Protocol Suite Vulnerabilities and Network Attack Vectors"
description: "A comprehensive technical analysis of IPv4, IPv6, TCP, and UDP header structures and the specific protocol vulnerabilities exploited by threat actors to execute reconnaissance, spoofing, and Denial-of-Service attacks."
order: 16
---

# Attacking the Foundation — Module 16

> **Module Objective**: Explain how TCP/IP vulnerabilities enable network attacks.

---

## MODULE OVERVIEW

This module identifies the inherent design weaknesses within the **TCP/IP stack** that facilitate modern network-based attacks. Originally engineered for connectivity and efficiency, these protocols lack native authentication mechanisms for source validation, allowing threat actors to manipulate header fields for malicious purposes. The primary objective is to explain how **IPv4/IPv6** connectionless delivery and **TCP/UDP** stateful/stateless operations are exploited to compromise network integrity and availability.

| Topic | Objective |
| :--- | :--- |
| IP PDU Details | Explain the IPv4 and IPv6 header structure |
| IP Vulnerabilities | Explain how IP vulnerabilities enable network attacks |
| TCP and UDP Vulnerabilities | Explain how TCP and UDP vulnerabilities enable network attacks |

---

## CORE CONCEPTS & DEFINITIONS

### IP Protocol Architecture

Internet Protocol (IP) serves as the **Layer 3** connectionless protocol responsible for packet delivery between source and destination hosts.

- **Source Validation**: IP does **not** natively validate the source address contained in a packet, enabling **IP spoofing** by threat actors.
- **Flow Management**: IP is not designed to track packet flow; this function is deferred to **TCP** at Layer 4.
- **Fragmentation**: Fields such as **Identification**, **Flags**, and **Fragment Offset** allow packets to be divided to meet Maximum Transmission Unit (MTU) requirements and later reassembled.

### Transport Layer Characteristics

| Protocol | Type | Reliability | Use Cases |
| :--- | :--- | :--- | :--- |
| **TCP** | Connection-oriented (stateful) | High — uses ACKs, flow control, retransmission | HTTP, SSL/TLS, FTP, DNS zone transfers |
| **UDP** | Connectionless (stateless) | Low — no retransmission or sequencing | DNS queries, DHCP, TFTP, VoIP, media streaming, SNMP |

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### IPv4 Packet Header

The IPv4 header is **20 bytes** minimum. Its key fields are:

| Field | Size | Description |
| :--- | :--- | :--- |
| **Version** | 4 bits | Binary `0100` — identifies IPv4 |
| **Internet Header Length (IHL)** | 4 bits | Length of the IP header; minimum 20 bytes |
| **Differentiated Services (DS)** | 8 bits | QoS/priority; contains DSCP (6 bits) + ECN (2 bits) |
| **Total Length** | 16 bits | Total size of the IP packet (header + data); max 65,535 bytes |
| **Identification** | 16 bits | Unique fragment identifier |
| **Flags** | 3 bits | Control fragmentation (DF, MF bits) |
| **Fragment Offset** | 13 bits | Position of the fragment in the original packet |
| **Time-to-Live (TTL)** | 8 bits | Decremented by 1 per router hop; packet dropped at 0 → ICMP Time Exceeded sent |
| **Protocol** | 8 bits | Identifies next-layer protocol: ICMP=1, TCP=6, UDP=17 |
| **Header Checksum** | 16 bits | Detects corruption in the header |
| **Source IPv4 Address** | 32 bits | Always a unicast address |
| **Destination IPv4 Address** | 32 bits | Target host address |
| **Options & Padding** | 0–32 bits | Optional; padded to 32-bit boundary |

### IPv6 Packet Header

The IPv6 header is a **fixed 40 bytes**. Unlike IPv4, it has no checksum and moves optional data to **Extension Headers**.

| Field | Size | Description |
| :--- | :--- | :--- |
| **Version** | 4 bits | Binary `0110` — identifies IPv6 |
| **Traffic Class** | 8 bits | Equivalent to IPv4 DS field; QoS priority |
| **Flow Label** | 20 bits | Packets with the same label receive the same routing treatment |
| **Payload Length** | 16 bits | Size of the data portion (not including header) |
| **Next Header** | 8 bits | Equivalent to IPv4 Protocol field; identifies upper-layer payload or extension header |
| **Hop Limit** | 8 bits | Replaces TTL; decremented per hop; ICMPv6 Time Exceeded sent at 0 |
| **Source IPv6 Address** | 128 bits | Sending host address |
| **Destination IPv6 Address** | 128 bits | Receiving host address |

> **Key difference**: IPv6 carries optional network-layer information in **Extension Headers** attached to the main header, *not* in an inline Options field like IPv4.

### Header Comparison: IPv4 vs. IPv6

| Feature | IPv4 | IPv6 |
| :--- | :--- | :--- |
| Header size | 20 bytes (variable) | 40 bytes (fixed) |
| Addressing | 32-bit (4 bytes) | 128-bit (16 bytes) |
| TTL / Persistence | Time-to-Live (TTL) | Hop Limit |
| Protocol ID | Protocol field | Next Header field |
| Header integrity check | Header Checksum ✅ | None (handled by L2/L4) |
| Optional data | Options field (inline) | Extension Headers (chained) |
| Fragmentation | In-header fields | Extension Header only |

---

## TCP DEEP DIVE

### TCP Segment Header Fields

The TCP segment follows immediately after the IP header. Key fields:

| Field | Size | Role |
| :--- | :--- | :--- |
| Source Port | 16 bits | Originating application port |
| Destination Port | 16 bits | Target application port |
| Sequence Number | 32 bits | Tracks byte order of the data stream |
| Acknowledgment Number | 32 bits | Next expected byte from the other side |
| Header Length | 4 bits | Size of the TCP header |
| Control Bits (Flags) | 6 bits | Connection state management (see below) |
| Window | 16 bits | Flow control — advertised buffer size |
| Checksum | 16 bits | Header + data integrity |
| Urgent Pointer | 16 bits | Points to urgent data when URG flag is set |

### TCP Control Bits (Flags)

The 6-bit control field manages the state of a TCP connection:

| Flag | Full Name | Purpose |
| :--- | :--- | :--- |
| **SYN** | Synchronize | Initiates connection; synchronizes sequence numbers |
| **ACK** | Acknowledgment | Acknowledges received data |
| **RST** | Reset | **Abrupt** connection teardown; used in TCP Reset attacks |
| **FIN** | Finish | **Graceful** termination; no more data from sender |
| **URG** | Urgent | Urgent pointer field is significant |
| **PSH** | Push | Requests immediate data delivery to the application layer |

### TCP Three-Way Handshake

Before data transfer, TCP establishes a stateful connection:

```
Client                        Server
  |--- SYN (SEQ=100) -------->|   Step 1: Client requests session
  |<-- SYN-ACK (SEQ=300, ----)|   Step 2: Server acknowledges + requests reverse session
  |        ACK=101)            |
  |--- ACK (SEQ=101, -------->|   Step 3: Client acknowledges
  |        ACK=301)            |
       [Connection Established]
```

### TCP Four-Way Termination

A graceful session close uses 4 steps:

1. Client sends **FIN** (no more data to send)
2. Server sends **ACK** (acknowledges FIN)
3. Server sends **FIN** (server-to-client session ends)
4. Client sends **ACK** (acknowledges server FIN)

---

## UDP DEEP DIVE

### UDP Segment Structure

UDP has a minimal 8-byte header:

| Field | Size | Description |
| :--- | :--- | :--- |
| Source Port | 16 bits | Originating port |
| Destination Port | 16 bits | Target port |
| Length | 16 bits | Total length of UDP header + data |
| Checksum | 16 bits | Optional integrity check |

UDP provides **no** connection establishment, retransmission, sequencing, or flow control. This low overhead makes it ideal for time-sensitive applications where speed matters more than guaranteed delivery.

---

## OPERATIONAL ANALYSIS — ATTACK METHODOLOGIES

### IP-Based Attacks

| Attack Type | Mechanism | Goal |
| :--- | :--- | :--- |
| **ICMP Attack** | Uses echo requests (pings) to probe the network | Reconnaissance, host discovery, OS fingerprinting, DoS floods, routing table manipulation |
| **DoS** | Exhausts bandwidth or resources of a single target | Make services unavailable to legitimate users |
| **DDoS** | Simultaneous coordinated attack from multiple source machines | Same as DoS but at a larger, harder-to-block scale |
| **Amplification & Reflection** | Spoofed ICMP requests sent to many hosts; replies flood the victim (Smurf) | Overwhelm victim with amplified traffic |
| **Address Spoofing** | Forged source IP to hide identity or impersonate a user | Bypass ACLs, blind/non-blind attack setup |
| **MiTM** | Attacker positions between source and destination | Eavesdrop, capture, or modify traffic |
| **Session Hijacking** | Uses MiTM on physical network to take over an authenticated session | Unauthorized access to active sessions |

### ICMP Attack Details

ICMP was designed for diagnostic and error messages. Threat actors abuse it for:

- **Reconnaissance**: Echo requests to map topology, discover active hosts, and fingerprint OSes.
- **DoS floods**: ICMP flood (echo requests) to exhaust bandwidth.
- **Smurf Attack** (Amplification + Reflection): Threat actor sends ICMP echo requests to many hosts with the **victim's spoofed IP** as the source → all hosts reply to the victim, overwhelming it.

> **Defence**: Apply strict ICMP ACL filtering at the network edge. Use IDS/firewall to detect abnormal ICMP volumes.

### Address Spoofing: Blind vs. Non-Blind

| Type | Attacker Visibility | Typical Use |
| :--- | :--- | :--- |
| **Non-blind spoofing** | Can see traffic between host and target; inspects replies | Firewall state analysis, sequence number prediction, session hijacking |
| **Blind spoofing** | Cannot see return traffic | DoS attacks |
| **MAC spoofing** | Internal network access required; alters MAC to match a target | Overwrite switch CAM table, redirect frames to attacker |

---

## TRANSPORT LAYER EXPLOITATION

### TCP Attack Summary

| Attack | Exploited Mechanism | Method | Effect |
| :--- | :--- | :--- | :--- |
| **TCP SYN Flood** | Three-way handshake | Send many SYN packets with spoofed source IPs; never complete handshake | Server connection queue exhausted; service denied (DoS) |
| **TCP Reset Attack** | RST control bit | Send spoofed packet with RST bit set to one or both endpoints | Immediate abrupt teardown of active TCP session |
| **TCP Session Hijacking** | Sequence numbers | Spoof IP of an authenticated host; predict next sequence number; send ACK to other host | Attacker can send data as the hijacked host |

### TCP SYN Flood — Step by Step

1. Threat actor sends **multiple SYN requests** to the web server using randomly **spoofed source IPs**.
2. Server replies with **SYN-ACK** to each spoofed address and waits for the final ACK.
3. ACKs never arrive — server accumulates **half-open connections**.
4. Server's connection queue is exhausted → **legitimate users are denied service**.

### UDP Attacks

| Attack | Method | Effect |
| :--- | :--- | :--- |
| **UDP Flood** | Tool (UDP Unicorn, LOIC) floods target ports with UDP packets from a spoofed host | Server sends ICMP port unreachable for every closed port → bandwidth exhaustion, similar to DoS |

> UDP is **not encrypted by default**. A threat actor can alter the payload and recalculate the 16-bit checksum to deliver tampered data undetected by the destination.

---

## CASE STUDIES & EXAM SPECIFICS

### Attack Identification Quick Reference

| Scenario | Attack Name |
| :--- | :--- |
| Attacker transparently monitors/captures communication between source and destination | **MiTM Attack** |
| Attacker gains physical network access and uses MiTM to manipulate legitimate traffic | **Session Hijacking** |
| Simultaneous, coordinated attack from multiple source machines | **DDoS / Amplification & Reflection** |
| Uses pings to discover subnets/hosts, generate floods, or alter routing tables | **ICMP Attack** |
| Packets with false source IP to hide identity or impersonate a user | **Address Spoofing** |
| Exploits the TCP three-way handshake with spoofed SYNs | **TCP SYN Flood** |
| Spoofed RST bit sent to both endpoints to tear down a session | **TCP Reset Attack** |
| Spoofs IP + predicts sequence number to take over an authenticated session | **TCP Session Hijacking** |
| Floods UDP packets to closed ports; server replies with ICMP unreachable | **UDP Flood Attack** |

### Critical Header Logic for Analysts

- **TTL / Hop Limit = 0**: Router discards the packet and sends an **ICMP Time Exceeded** message back to the source. Analysts can use abnormal TTL values to detect traceroute scans or crafted packets.
- **IPv6 Extension Headers**: Optional network-layer information in IPv6 is carried via **Extension Headers chained to the main header**, not embedded in it (unlike IPv4 Options).
- **Header Checksum (IPv4 only)**: Used to detect corruption introduced during transmission. IPv6 removes this field, relying on Layer 2 (Ethernet CRC) and Layer 4 (TCP/UDP checksum).
- **Protocol / Next Header field**: Identifies what follows the IP header. Common values: `1` = ICMP, `6` = TCP, `17` = UDP.
- **Sequence Numbers in TCP**: Critical for both reliable delivery and session hijacking. An attacker who can predict the next sequence number can inject forged packets into an active session.

### Session Hijacking vs. MiTM — Key Distinction

| | Session Hijacking | MiTM |
| :--- | :--- | :--- |
| **Scope** | Takes over an *already-authenticated* session | Broader — monitors or controls communication |
| **Requirements** | Spoof IP + predict sequence number | Physical/logical positioning between two hosts |
| **Can receive data?** | No (attacker can *send* but not receive) | Yes |
| **Detection difficulty** | High | High |

---

## SUMMARY CHECKLIST

- [ ] Understand all IPv4 and IPv6 header fields and their sizes
- [ ] Know the 6 TCP flags and their role in connection lifecycle and attacks
- [ ] Describe the TCP three-way handshake and four-way termination
- [ ] Differentiate DoS vs. DDoS vs. Amplification/Reflection
- [ ] Identify attack type from a given scenario (exam skill)
- [ ] Explain blind vs. non-blind IP spoofing
- [ ] Know which tools are used in UDP flood attacks (UDP Unicorn, LOIC)
- [ ] Explain how TCP Session Hijacking differs from a basic MiTM
