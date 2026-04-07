---
title: "Ethernet Layer 2 Operations and Address Resolution Protocol Analysis"
description: "A comprehensive technical reference covering Ethernet II frame encapsulation, MAC and IP address functional roles, the operational mechanics of the Address Resolution Protocol (ARP), Wireshark traffic analysis, and security considerations for the CyberOps Associate curriculum."
order: 8
---

## MODULE OVERVIEW

In modern local area network (LAN) environments, data communication relies on the encapsulation of upper-layer protocols into Layer 2 frames. This process is dictated by the media access type; specifically, for Transmission Control Protocol (TCP) and Internet Protocol (IP) suites operating over Ethernet, the standard encapsulation format is the **Ethernet II frame**.

Effective communication requires the synchronization of two distinct addressing schemes: **Physical Addressing** (MAC) and **Logical Addressing** (IP). While IP addresses facilitate the delivery of packets from the original source to the final destination across network boundaries, MAC addresses are utilized for node-to-node delivery within the same local network segment. The **Address Resolution Protocol (ARP)** serves as the critical mechanism for mapping these logical IPv4 addresses to physical MAC addresses.

> **Scope of this document:** This reference covers Layer 2 frame structure, ARP operational flow, Wireshark-based traffic analysis (based on the Cisco Networking Academy Lab *"Using Wireshark to Examine Ethernet Frames"*), exam-oriented Q&A, and known ARP security vulnerabilities.

---

## CORE CONCEPTS & DEFINITIONS

| Term | Definition |
| :--- | :--- |
| **MAC Address** | A 48-bit (6-octet) physical identifier expressed as 12 hexadecimal digits. Used for NIC-to-NIC communication on the same network segment. The first 6 hex digits = OUI (vendor); the last 6 = NIC serial number. |
| **IP Address** | A logical address that identifies the original source and final destination. Remains constant across all network hops; the Layer 2 frame is re-encapsulated at each router. |
| **ARP** | Address Resolution Protocol — maps a known IPv4 address to a physical MAC address. Maintains an **ARP cache** (stored in RAM). |
| **ARP Cache / ARP Table** | A RAM-resident table storing known IP-to-MAC mappings. Consulted before any ARP request is generated. Entries expire after a timeout. |
| **Default Gateway** | The router interface responsible for forwarding traffic to remote networks. When the destination is on a different subnet, the host resolves the **gateway's MAC address**, not the remote host's. |
| **ICMPv6 Neighbor Discovery (ND)** | The IPv6 functional equivalent to ARP. Uses **Neighbor Solicitation (NS)** and **Neighbor Advertisement (NA)** messages instead of ARP broadcasts. |
| **EtherType** | A 2-byte field in the Ethernet II header identifying the encapsulated upper-layer protocol (e.g., `0x0800` = IPv4, `0x0806` = ARP). |
| **FCS** | Frame Check Sequence — a 4-byte CRC trailer used for error detection. Not displayed in Wireshark captures. |
| **OUI** | Organizationally Unique Identifier — the first 3 bytes (6 hex digits) of a MAC address, assigned to a NIC manufacturer by the IEEE. |

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Table 1: Ethernet II Frame Structure

```
 +-----------+---------+---------+-------+------------------+-----+
 | Preamble  |  Dst    |  Src    | Type  |       Data       | FCS |
 | (8 bytes) | (6 B)   | (6 B)   | (2 B) | (46 – 1500 B)    | (4B)|
 +-----------+---------+---------+-------+------------------+-----+
```

| Field | Size | Technical Description | Wireshark Visibility |
| :--- | :---: | :--- | :---: |
| **Preamble** | 8 B | Synchronizing bits processed by NIC hardware at the physical layer. | ❌ Not shown |
| **Destination Address** | 6 B | 48-bit Layer 2 address. Can be unicast, multicast, or broadcast (`FF:FF:FF:FF:FF:FF`). | ✅ |
| **Source Address** | 6 B | 48-bit address of the sending NIC. **Always unicast.** | ✅ |
| **Frame Type (EtherType)** | 2 B | Identifies the upper-layer protocol. `0x0800` = IPv4 · `0x0806` = ARP. | ✅ |
| **Data** | 46–1500 B | Encapsulated Layer 3 PDU (IPv4 packet, ARP payload, etc.). | ✅ |
| **FCS** | 4 B | Cyclic Redundancy Check (CRC) for error detection. Computed by sender, verified by receiver. | ❌ Not shown |

> **Note:** Neither the Preamble nor the FCS are displayed in Wireshark. The Preamble is consumed entirely by hardware for clock synchronization before any data is passed to the OS.

---

### Table 2: Common EtherType Values

| EtherType Value | Protocol |
| :---: | :--- |
| `0x0800` | Internet Protocol version 4 (IPv4) |
| `0x0806` | Address Resolution Protocol (ARP) |
| `0x86DD` | Internet Protocol version 6 (IPv6) |
| `0x8100` | IEEE 802.1Q VLAN tagging |

---

### Table 3: MAC Address vs. IP Address — Role Comparison

| Attribute | MAC Address (Layer 2) | IP Address (Layer 3) |
| :--- | :--- | :--- |
| **Primary Purpose** | Local NIC-to-NIC delivery within a broadcast domain | End-to-end device identification across networks |
| **Scope** | Restricted to the local network segment | Global / inter-network routing |
| **Persistence** | **Changes** at every Layer 3 hop (router re-encapsulates) | **Remains constant** from source to final destination |
| **Address Length** | 48 bits (6 bytes) | 32 bits (IPv4) / 128 bits (IPv6) |
| **Notation** | Hexadecimal (e.g., `f4:8c:50:62:62:6d`) | Dotted decimal (e.g., `10.0.0.13`) |
| **Assignment** | Burned into NIC hardware (can be spoofed in software) | Assigned by network administrator or DHCP |
| **Layer examined by** | Switches (Layer 2 devices) | Routers (Layer 3 devices) |

---

## OPERATIONAL ANALYSIS

### ARP Resolution Workflow

When a host prepares a Layer 2 PDU for transmission, it follows this decision logic:

```
Host wants to send a packet
        │
        ▼
Is the destination on the LOCAL network?
        │
   YES  │                          NO
        ▼                          ▼
Search ARP cache            Use Default Gateway IP
for destination MAC         Search ARP cache for
        │                   Gateway MAC address
        │                          │
   Found? ──── YES ──────────────► Encapsulate frame
        │                          and transmit
        NO
        │
        ▼
Send ARP Request (Broadcast: FF:FF:FF:FF:FF:FF)
"Who has [Target IP]? Tell [Source IP]"
        │
        ▼
Target device replies with ARP Reply (Unicast)
"[Target IP] is at [Target MAC]"
        │
        ▼
Update ARP Cache (stored in RAM)
        │
        ▼
Encapsulate frame and transmit
```

#### Step-by-step detail:

1. **ARP Cache Search** — The host first checks its **ARP table** (in RAM) for an existing IP-to-MAC mapping.
2. **ARP Request** — If no entry is found, the host broadcasts an **ARP Request** (`Destination MAC: FF:FF:FF:FF:FF:FF`) to all devices on the local segment.
3. **ARP Reply** — Only the device owning the requested IP responds with a **unicast ARP Reply** containing its MAC address.
4. **Cache Update** — The mapping is stored in the ARP table. The host proceeds with frame encapsulation and transmission.

> **Key distinction:** ARP requests are **broadcasts**; ARP replies are **unicasts**.

---

### Local vs. Remote Traffic — Detailed Comparison

The following scenarios are based on the Cisco Lab topology (`10.0.0.0/24` local network, `172.16.0.0/12` remote network via router R1):

#### Scenario A — Local Traffic (H3 → H1, same subnet)

| Step | Action | Layer 2 Detail |
| :---: | :--- | :--- |
| 1 | H3 (`10.0.0.13`) pings H1 (`10.0.0.11`) | Recognizes same subnet |
| 2 | H3 checks ARP cache for `10.0.0.11` | Cache may be empty after `arp -d` |
| 3 | H3 broadcasts ARP Request | Dst MAC: `FF:FF:FF:FF:FF:FF` |
| 4 | H1 replies with unicast ARP Reply | H1's MAC address returned |
| 5 | H3 sends ICMP Echo Request directly to H1 | Dst MAC = H1's MAC |

#### Scenario B — Remote Traffic (H3 → H4, different subnet)

| Step | Action | Layer 2 Detail |
| :---: | :--- | :--- |
| 1 | H3 (`10.0.0.13`) pings H4 (`172.16.0.40`) | Recognizes **different** subnet |
| 2 | H3 checks ARP cache for **default gateway** `10.0.0.1` | Not H4's IP — the gateway's IP |
| 3 | H3 ARP-resolves the **gateway's MAC** | Dst MAC in frame = R1's MAC |
| 4 | H3 sends ICMP frame to R1 | IP packet Dst = `172.16.0.40`; Frame Dst MAC = R1's MAC |
| 5 | R1 forwards the packet toward H4 | R1 re-encapsulates with new Layer 2 frame |

> **Critical insight:** The **destination IP address** changes between Scenario A and B, but the **destination MAC address** in the frame always points to the **next-hop device** (directly connected host or default gateway). The IP address inside the packet remains the true final destination throughout.

---

### Traffic Analysis with Wireshark (PCAP)

Wireshark is the primary tool used to inspect ARP and ICMP frame behavior. Below is a reference for what analysts observe during a typical ARP + ping capture session.

#### Observed ARP Request Frame (EtherType `0x0806`)

| Field | Observed Value | Notes |
| :--- | :--- | :--- |
| Destination MAC | `ff:ff:ff:ff:ff:ff` | Broadcast — sent to all hosts on the segment |
| Source MAC | `f4:8c:50:62:62:6d` (e.g., IntelCor NIC) | Sending host's physical address |
| EtherType | `0x0806` | Identifies payload as ARP |
| Info (Wireshark) | `Who has 192.168.1.1? Tell 192.168.1.6` | ARP Request message |
| IPv4 Header | **Not present** | ARP is encapsulated directly in Ethernet — no IP header |
| Preamble | Not displayed | Consumed by hardware |
| FCS | Not displayed | Computed and verified by hardware |

#### Observed ICMP Echo Request Frame (EtherType `0x0800`)

| Field | Local Ping (same subnet) | Remote Ping (different subnet) |
| :--- | :--- | :--- |
| Dst MAC | Target host's MAC | Default gateway (router) MAC |
| Src MAC | Sender's MAC | Sender's MAC |
| EtherType | `0x0800` (IPv4) | `0x0800` (IPv4) |
| Src IP (in data) | Sender's IP | Sender's IP |
| Dst IP (in data) | Local target IP | Remote target IP |

#### Wireshark Filter Reference

| Filter | Purpose |
| :--- | :--- |
| `arp` | Show only ARP frames |
| `icmp` | Show only ICMP (ping) traffic |
| `arp or icmp` | Show both — useful for full ARP+ping session analysis |
| `eth.dst == ff:ff:ff:ff:ff:ff` | Isolate all broadcast frames |

---

### MAC Address Anatomy

```
  f4  :  8c  :  50  :  62  :  62  :  6d
 └────────────────┘   └────────────────┘
      OUI / Vendor ID       NIC Serial Number
   (Manufacturer = Intel)
```

- **OUI (first 3 bytes / 6 hex digits):** Assigned by IEEE to the manufacturer. In the lab capture, `f4:8c:50` = Intel Corporation.
- **Serial Number (last 3 bytes / 6 hex digits):** Uniquely identifies the NIC within the vendor's product line.

---

## SECURITY VULNERABILITIES

### ARP Spoofing / ARP Poisoning

ARP has **no built-in authentication mechanism**. Any device on the network can send an ARP Reply without having received an ARP Request. This design flaw enables:

#### Attack Mechanics

```
Legitimate Flow:
  Host A ──ARP Request──► (broadcast) ──► Router (10.0.0.1)
  Host A ◄──ARP Reply──────────────────── Router (MAC: aa:bb:cc:dd:ee:ff)

ARP Poisoning Attack:
  Host A ──ARP Request──► (broadcast)
  Attacker sends UNSOLICITED ARP Reply:
  "10.0.0.1 is at [Attacker MAC]"
  Host A ◄──Forged ARP Reply─────────── Attacker
  Host A now sends all traffic to Attacker → Man-in-the-Middle (MitM)
```

#### ARP Spoofing vs. MAC Spoofing

| Attack | Mechanism | Goal |
| :--- | :--- | :--- |
| **ARP Spoofing / Poisoning** | Sends forged ARP Replies to associate attacker's MAC with a legitimate IP (e.g., default gateway) | Intercept / redirect traffic (MitM), enable eavesdropping or modification |
| **MAC Spoofing** | Changes the attacker's NIC MAC address to impersonate a legitimate host | Deceive switches into forwarding frames to the attacker instead of the real host; bypass MAC-based security filters |

#### Impact

- **Man-in-the-Middle (MitM):** Attacker intercepts, reads, or modifies traffic between two hosts.
- **Denial of Service (DoS):** Attacker associates an invalid MAC with the gateway IP, dropping all traffic.
- **Session Hijacking:** After MitM is established, the attacker can inject malicious data into active sessions.

#### Mitigations

| Mitigation | Description |
| :--- | :--- |
| **Dynamic ARP Inspection (DAI)** | Cisco switch feature that validates ARP packets against a trusted DHCP snooping binding table |
| **Static ARP entries** | Manually configure critical IP-to-MAC mappings (not scalable for large networks) |
| **802.1X Port Authentication** | Ensure only authenticated devices can connect to switch ports |
| **Network monitoring / IDS** | Detect anomalous ARP traffic patterns (e.g., gratuitous ARP floods) |
| **VPN / Encrypted channels** | Even if traffic is intercepted, encryption renders it unreadable |

---

## EXAM REFERENCE — Q&A BANK

The following questions and answers are derived from the CyberOps Associate curriculum and the Cisco lab exercise.

---

**Q: How does the ARP process use an IP address?**
> ✅ To determine the **MAC address of a device on the same network**.
> ARP resolves a known IP address to an unknown MAC address within the local broadcast domain.

---

**Q: What will a host do FIRST when preparing a Layer 2 PDU for a host on the same Ethernet network?**
> ✅ It will **search the ARP table** for the MAC address of the destination host.
> Only if no entry is found will it initiate an ARP request.

---

**Q: When an IP packet is sent to a host on a REMOTE network, what information is provided by ARP?**
> ✅ The **MAC address of the router interface closest to the sending host** (i.e., the default gateway's MAC).
> ARP never directly resolves remote host MACs — it resolves the next-hop device.

---

**Q: A host needs to reach another host on a remote network, but the ARP cache has no mapping. To what destination address will the ARP request be sent?**
> ✅ The **broadcast MAC address** (`FF:FF:FF:FF:FF:FF`).
> ARP requests are always broadcasts on the local network segment.

---

**Q: What is the aim of an ARP spoofing attack?**
> ✅ To **associate IP addresses to the wrong MAC address**.
> This allows the attacker to intercept or redirect traffic (MitM).

---

**Q: In what kind of memory is the ARP table stored?**
> ✅ **RAM** (volatile memory).
> The ARP cache is cleared on reboot and entries expire after a configurable timeout.

---

**Q: What is a characteristic of ARP messages?**
> ✅ **ARP replies are unicast.**
> ARP requests are broadcasts (flooded to all ports by the switch). ARP is not encapsulated in an IPv4 header — it goes directly inside the Ethernet frame.

---

**Q: What statement best describes the function of ARP?**
> ✅ ARP is used to discover the **MAC address of any host on the local network**.
> ARP does not work across routed boundaries — it is scoped to the local broadcast domain.

---

**Q: Why would an attacker want to spoof a MAC address?**
> ✅ So that **a switch on the LAN will start forwarding frames to the attacker instead of the legitimate host**.
> MAC spoofing can also be used to bypass port security filters or impersonate trusted devices.

---

**Q: What important information is examined in the Ethernet frame header by a Layer 2 device (switch) to forward data?**
> ✅ The **Destination MAC address**.
> Switches build MAC address tables by reading source MAC addresses, then forward frames based on the destination MAC.

---

**Q: What does the Preamble field contain, and why is it not shown in Wireshark?**
> ✅ The Preamble contains **synchronizing bits** used by the NIC hardware to establish clock synchronization at the physical layer. It is processed entirely by hardware before any data reaches the OS or capture software, so Wireshark never sees it.

---

**Q: Why does the destination IP address change when pinging a remote host, but the destination MAC address remains the same as for the default gateway?**
> ✅ Because the **IP address identifies the final destination** (which is on a remote network), while the **MAC address only identifies the next-hop device** (the default gateway on the local segment). The frame's MAC destination always refers to the next directly connected device, which in this case is the router.

---

## SUMMARY CHEAT SHEET

| Concept | Key Fact |
| :--- | :--- |
| ARP request type | **Broadcast** (`FF:FF:FF:FF:FF:FF`) |
| ARP reply type | **Unicast** |
| ARP cache storage | **RAM** |
| ARP EtherType | `0x0806` |
| IPv4 EtherType | `0x0800` |
| Remote destination MAC resolved by ARP | **Default gateway's MAC**, not the remote host's |
| Layer 2 device forwarding decision | Based on **Destination MAC address** |
| Preamble in Wireshark | **Not visible** — processed by hardware |
| FCS in Wireshark | **Not visible** — checked and stripped by NIC |
| ARP security weakness | **No authentication** — vulnerable to spoofing/poisoning |
| ARP spoofing goal | Associate attacker MAC with legitimate IP → **MitM** |
| MAC spoofing goal | Impersonate host → **switch forwards frames to attacker** |
| IPv6 ARP equivalent | **ICMPv6 Neighbor Discovery (NS/NA)** |

---
