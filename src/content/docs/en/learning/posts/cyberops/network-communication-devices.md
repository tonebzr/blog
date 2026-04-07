---
title: "Network Communication Devices and Infrastructure Operations"
description: "A comprehensive technical analysis of Layer 2 and Layer 3 infrastructure components, routing protocol classifications, wireless association methodologies, and multilayer switching within the CyberOps framework."
order: 11
---

## MODULE OVERVIEW

The network infrastructure constitutes the fundamental architecture for device interconnection and end-to-end communication. Adhering to industry-standard designs is essential for ensuring network availability and security. This module details the operational mechanics of network communication devices, covering both wired and wireless infrastructures.

For the cybersecurity analyst, mastering these operations is critical for interpreting logs, performing packet captures (PCAP), and identifying anomalies such as routing table poisoning or BGP hijacking.

## CORE CONCEPTS & DEFINITIONS

### End Devices and Addressing

End devices serve as the source or destination for all network-transmitted messages. To facilitate unique identification, every end device is assigned a specific address. Communication is initiated when a source device specifies the destination end device's address for message delivery.

### Intermediary Device Roles

Intermediary devices function as the connective tissue of the infrastructure, determining data paths and directing traffic toward its final destination.

| Device | OSI Layer | Primary Role |
| :--- | :---: | :--- |
| **Router** | Layer 3 | Interconnects remote networks; performs path determination and packet forwarding between disparate IP networks |
| **LAN Switch** | Layer 2 | Multiport bridge connecting devices in a star topology; segments a LAN into separate collision domains per port |
| **Multilayer Switch** | Layer 2 / 3 | Combines switching and routing; supports SVIs and routed ports for inter-VLAN routing |
| **Wireless Access Point (AP)** | Layer 1 / 2 | Connects mobile/battery-powered devices via Radio Frequencies (RF) instead of physical cabling |
| **Bridge** | Layer 2 | Divides networks into multiple collision domains; makes forwarding decisions based on MAC addresses |
| **Hub** | Layer 1 | Multiport repeater; regenerates signals out all ports without intelligence; legacy device |
| **WLAN Controller (WLC)** | Management | Centrally manages and controls a large number of corporate Access Points |

> **Note for CyberOps analysts:** Hubs and bridges are essentially legacy and rarely found in modern deployments. Their presence may indicate an outdated or poorly secured network segment.

## TECHNICAL TAXONOMY & CLASSIFICATION

### Routing Protocol Classifications

Dynamic routing protocols are categorized based on their path-determination algorithms and operational scope.

| Protocol Category | Protocol Examples | Key Metric / Algorithm | Operational Characteristics |
| :--- | :--- | :--- | :--- |
| **Distance Vector** | RIPv2, RIPng, EIGRP, EIGRP for IPv6 | Hop count (RIP); Composite (EIGRP: bandwidth, delay, reliability, load) | Determines path based on distance and direction; uses "rumor-based" updates (routing by hearsay); EIGRP uses DUAL algorithm for loop-free fast convergence |
| **Link-State** | OSPFv2, OSPFv3, IS-IS, IS-IS for IPv6 | Cost (OSPF); Dijkstra (SPF) algorithm | Each router builds a complete topological map (Link-State Database); calculates shortest path tree independently; converges faster than Distance Vector |
| **Path Vector** | BGP-4, BGP-MP | AS_PATH attributes | Used between Autonomous Systems (ISPs); bases decisions on path attributes rather than simple distance; critical to monitor for BGP hijacking |

> **CyberOps relevance:** Routers periodically exchange routing messages that are visible in packet captures. Unexpected routing updates (e.g., RIP broadcasts, OSPF Hello packets, BGP OPEN/UPDATE messages) can signal misconfigurations or active route injection attacks.

### Comparison of 802.3 (Wired) and 802.11 (Wireless) Standards

Wired and wireless LANs share a common IEEE 802 origin but differ significantly in physical and data link layer implementations.

| Characteristic | 802.11 Wireless LAN | 802.3 Wired Ethernet LAN |
| :--- | :--- | :--- |
| **Physical Layer** | Radio Frequency (RF) | Physical Cabling |
| **Media Access** | Collision Avoidance (CSMA/CA) | Collision Detection (CSMA/CD) |
| **Duplex** | Half-duplex (shared RF medium) | Full-duplex capable |
| **Availability** | Any NIC within signal range | Requires physical connection |
| **Signal Integrity** | Subject to interference | Minimal interference |
| **Regulation** | Varies by country/region | IEEE 802.3 standard |
| **Privacy** | RF signals can extend beyond facility boundaries | Contained to physical medium |
| **Frame Format** | Additional Layer 2 header fields required | Standard Ethernet frame |

## OPERATIONAL ANALYSIS

### Layer 3 Packet Forwarding Process

Routers perform two primary functions: path determination and packet forwarding. Path determination involves building a routing table—a database of known networks—either manually (static) or via dynamic protocols.

When a router receives a packet, it executes a three-step process:

1. **De-encapsulation**: The Layer 2 frame header and trailer are removed to expose the Layer 3 packet.
2. **Path Lookup**: The router examines the destination IP address against the routing table to find the best match.
3. **Re-encapsulation**: If a path exists, the Layer 3 packet is encapsulated into a new Layer 2 frame appropriate for the exit interface.

During this transit, the Layer 3 IP addresses remain constant, but the Layer 2 data link addresses are rewritten at every hop.

#### Routing Table Population Methods

| Method | Description |
| :--- | :--- |
| **Local Route** | Added automatically when an interface is configured and active (IOS 15+ for IPv4) |
| **Directly Connected** | Added when an interface is configured and active |
| **Static Route** | Manually configured; active when exit interface is up |
| **Dynamic Protocol** | Learned via EIGRP, OSPF, RIP, BGP, etc. |

#### Packet Forwarding Outcomes

| Scenario | Router Action |
| :--- | :--- |
| Destination on directly connected network | ARP (IPv4) or ICMPv6 NS (IPv6) to resolve destination MAC; forward directly |
| Destination on remote network | ARP/NS to resolve **next-hop router** MAC address; forward to next hop |
| No match in routing table, no default route | Packet is **dropped** |

### CSMA/CA — Wireless Media Access

WLANs are half-duplex, shared media. Because a wireless client cannot detect collisions while transmitting, 802.11 uses **CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)**:

1. Client listens to check if the channel is idle.
2. Client sends a **Ready To Send (RTS)** message to the AP.
3. AP replies with a **Clear To Send (CTS)** message granting access.
4. If no CTS is received, the client waits a random backoff time and retries.
5. Client transmits data.
6. All transmissions must be acknowledged; missing ACK triggers retransmission.

### Layer 2 Switching Logic

Switches maintain a MAC address table (or Content Addressable Memory — CAM table) to direct frames.

* **Learning**: The switch examines the **source MAC address** of every incoming frame and records it alongside the ingress port. By default, entries are kept for **5 minutes**.
* **Forwarding**: The switch examines the **destination MAC address**. If it is in the table, the frame is sent out the specific port. If it is an unknown unicast or broadcast, it is **flooded** out all ports except the ingress port.

> **Security note:** CAM table overflow attacks (MAC flooding) exploit the flooding behavior by filling the table with fake MAC entries, forcing the switch to flood all traffic — effectively turning it into a hub and enabling passive eavesdropping.

### VLAN and Inter-VLAN Routing

Virtual LANs (VLANs) segment broadcast domains logically, regardless of physical location. This improves performance and security by isolating traffic. Each VLAN is considered a separate logical network and must have a unique network number.

* **Inter-VLAN Routing**: Packets traveling between VLANs must be routed. Two common methods:

| Method | Description |
| :--- | :--- |
| **Router-on-a-Stick** | A single physical router interface uses sub-interfaces (802.1Q encapsulation) to route between VLANs |
| **Switch Virtual Interface (SVI)** | A virtual Layer 3 interface on a multilayer switch assigned to a specific VLAN; no physical port required; can be configured with IP addresses and ACLs |

### Multilayer Switching

Multilayer switches (Layer 3 switches) perform both Layer 2 switching and Layer 3 routing. Cisco Catalyst multilayer switches support two types of Layer 3 interfaces:

* **Routed Port**: A physical port configured as a pure Layer 3 interface (similar to a router interface). Not associated with a VLAN; Layer 2 protocols like STP do not function on it. Does **not** support sub-interfaces (unlike IOS routers).
* **Switch Virtual Interface (SVI)**: A virtual interface created for any existing VLAN. Multiple SVIs can coexist on one switch. Provides Layer 3 processing for all ports in the associated VLAN.

## CASE STUDIES & EXAM SPECIFICS

### Wireless Association Process

The 802.11 association process occurs in three distinct stages:

1. **Discovery**:
    * **Passive Mode**: The client listens for **Beacon frames** broadcast by the AP containing the SSID, supported standards, and security settings. Passive mode generates the **least** traffic on the WLAN.
    * **Active Mode**: The client broadcasts **Probe Request frames** (with or without a known SSID) on multiple channels to discover available WLANs. Active mode generates the **most** traffic. Required if the AP is configured to suppress beacon broadcasts.
2. **Authentication**:
    * The client and AP agree to share **Open authentication**, OR
    * Initiate a **shared key authentication process**.
    * The client sends its MAC address; the AP responds accordingly.
3. **Association**:
    * Client sends its MAC address to the AP.
    * Client receives the AP's MAC address (**BSSID**).
    * Client receives the AP's **Association Identifier (AID)**.

#### Wireless Association Parameters

| Parameter | Description |
| :--- | :--- |
| **SSID** | Network name; identifies the WLAN; used by clients to select a network |
| **Password** | Required by the client to authenticate to the AP |
| **Network Mode** | 802.11 standard variant (a/b/g/n/ac/ad); APs can operate in **Mixed mode** |
| **Security Mode** | WEP, WPA, or WPA2; always enable the highest level supported |
| **Channel Settings** | Frequency bands used to transmit data; can be set automatically or manually to avoid interference |

#### Wireless Router Roles (Home / Small Business)

A wireless router typically performs two simultaneous roles:
* **Access Point (AP)** — provides wireless connectivity
* **Ethernet Switch** — provides wired LAN ports for local devices

### Loop Prevention via STP

In redundant topologies, the **Spanning Tree Protocol (STP)** is vital to prevent Layer 2 loops. STP intentionally blocks redundant paths, ensuring only one logical path exists between any two destinations. If a primary link fails, STP recalculates and unblocks paths to maintain connectivity.

> **Key distinction:** STP blocks user data on redundant ports, but **BPDU (Bridge Protocol Data Unit)** frames continue to flow on all ports to allow loop detection and recalculation.

### Critical Technical Distinctions

* **Channel Settings**: Refers to the specific frequency bands used for wireless data transmission — not to be confused with SSID or security mode.
* **Next-Hop Resolution**: If a destination is on a remote network, the router resolves the MAC address of the **next-hop router** (not the final destination) via ARP or ICMPv6 Neighbor Solicitation.
* **WLAN Controllers (WLC)**: Used in corporate environments to manage and control a large number of Access Points centrally; distinguishable from a basic WAP or router.
* **SVI inter-VLAN routing**: An SVI is needed for **each VLAN**; no physical interface per VLAN is required; no encapsulation type needs to be configured on the SVI itself.
* **VLAN IP addressing**: Each VLAN must use a **different network number** (subnet); VLANs do support VLSM and do use broadcast addresses within their subnet.
