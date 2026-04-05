---
title: Network Protocols, Layered Models, and Data Encapsulation
description: "A technical examination of the TCP/IP and OSI models, protocol data units (PDUs), and the mechanical processes of data transmission within a CyberOps environment."
order: 5
---

## MODULE OVERVIEW

Network communications are governed by standardized sets of rules known as **protocols**. These protocols define the requirements for message encoding, formatting, encapsulation, size, timing, and delivery. For a Cybersecurity Operations (CyberOps) analyst, understanding these protocols is foundational for traffic analysis, identifying anomalies, and determining the origin and destination of network traffic. Communication often follows a **client-server** model, where clients, such as web browsers, request services from specialized server software, such as HTTP servers.

### Why This Matters for CyberOps

As a cybersecurity analyst, you must be able to determine the origin of traffic entering the network and the destination of traffic leaving it. Understanding the path that network traffic takes — including which protocols are used at each layer — is essential for threat detection and incident response. Just as a car mechanic needs to understand the engine, a CyberOps analyst needs a deep understanding of how networks operate at the protocol level.

---

## CORE CONCEPTS & DEFINITIONS

### Networks of Many Sizes

Networks range from simple two-device setups to global infrastructures connecting millions of endpoints:

* **Home Networks:** Share resources (printers, files, media) among a small number of local end devices.
* **Small Office / Home Office (SOHO):** Allow remote workers to connect to corporate resources or centralized services.
* **Enterprise Networks:** Provide storage, email, messaging, and application access to large numbers of users.
* **The Internet:** The largest network in existence — a "network of networks" consisting of interconnected private and public networks. Traffic flows through **Tier 1** and **Tier 2** ISPs connected via **Internet Exchange Points (IXP)**. Larger organizations connect through a **Point of Presence (PoP)**. **Tier 3 ISPs** provide the last-mile connection to homes and businesses.

> **Note:** Traffic between a client and a server may take many different paths, and the return path may differ entirely from the outgoing path. This asymmetric routing is a key consideration for traffic analysis.

### Client-Server Communications

All network-connected devices that participate directly in communication are called **hosts**, **end devices**, **endpoints**, or **nodes**. Most interactions follow the **client-server model**:

* **Clients** use software (web browsers, email clients, file transfer applications) to request data from servers.
* **Servers** use specialized software to respond to those requests. A server can be single-purpose (e.g., a web server) or multi-purpose (e.g., handling web, email, and file transfer simultaneously).

Common server types include:

| Server Type | Function |
| :--- | :--- |
| **File Server** | Stores corporate and user files in a central location |
| **Web Server** | Runs HTTP/HTTPS software to serve web pages to clients |
| **Email Server** | Runs SMTP/POP3/IMAP software to send and receive email |

In **peer-to-peer networks**, hosts function as both clients and servers simultaneously — common in small home environments.

---

## COMMUNICATIONS PROTOCOLS

### What Are Protocols?

Simply having a physical or wireless connection between devices is not sufficient for communication. Devices must agree on **how** to communicate. These agreed-upon rules are called **protocols**.

Network protocols specify:

* **Message Encoding** — the process of converting information into the appropriate form for transmission (e.g., electrical signals, light pulses, radio waves). The receiving host decodes the signals back into usable data.
* **Message Formatting and Encapsulation** — the structure and packaging of data as it moves through the protocol stack.
* **Message Size** — constraints on the maximum size of a transmitted unit.
* **Message Timing** — rules governing transmission speed and synchronization (see below).
* **Delivery Options** — unicast, multicast, or broadcast.

### Delivery Options

| Method | Description |
| :--- | :--- |
| **Unicast** | Sent to a single, specific destination host |
| **Multicast** | Sent to a defined group of hosts |
| **Broadcast** | Sent to **all hosts in the same network** |

> **Exam Focus:** A broadcast is **not** sent to all hosts on the internet — it is scoped to the **local network**.

### Message Timing and Delivery

Operational efficiency depends on three primary timing mechanisms:

* **Flow Control:** The process of managing the rate of data transmission to prevent a source from overwhelming a destination. Source and destination devices negotiate and manage the flow of information using network protocols.
* **Response Timeout:** Specifies the duration a host waits for an acknowledgment before taking recovery actions, such as retransmitting the request.
* **Access Method:** Determines when a device is permitted to transmit on the shared medium to prevent collisions. For example, a WLAN NIC must determine whether the wireless medium is available before transmitting.

---

## DATA SEGMENTATION AND MULTIPLEXING

Large data streams cannot be transmitted as a single massive block. Sending everything at once would monopolize the network, and a single failure would require the entire transmission to be repeated.

* **Segmentation:** The process of dividing a large data stream into smaller pieces prior to transmission. Required by the TCP/IP protocol suite.
* **Multiplexing:** The process of interleaving multiple fragmented data conversations onto the same network medium simultaneously. This increases overall network throughput.
* **Sequencing:** Because segments may arrive out of order (they can take different paths through the network), **TCP** adds sequence numbers to each segment so the receiving host can reassemble the data in the correct order.

> **Efficiency benefit of segmentation:** If one segment is lost or corrupted, only that segment needs to be retransmitted — not the entire original data stream.

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Benefits of a Layered Model

Layered models modularize network operations, providing several key benefits:

* **Protocol design:** Each layer has a defined interface and acts on specific information, enabling independent development.
* **Interoperability:** Products from different vendors can communicate because they conform to the same layer standards.
* **Isolation of change:** A technology or capability change at one layer does not affect layers above or below it.
* **Common language:** A shared vocabulary to describe network functions and capabilities.

Two primary models are used:

* **OSI Reference Model** — 7 layers, primarily used as a conceptual reference.
* **TCP/IP Protocol Model** — 4 layers, reflects the actual structure of the TCP/IP protocol suite used on the internet.

### Comparison of Layered Models

The **OSI Reference Model** and the **TCP/IP Protocol Model** provide a framework for modularizing network operations into manageable layers.

| OSI Layer | OSI Name | TCP/IP Layer | PDU | Technical Function |
| :--- | :--- | :--- | :--- | :--- |
| 7 | **Application** | **Application** | Data | Process-to-process communication |
| 6 | **Presentation** | **Application** | Data | Data representation and encryption |
| 5 | **Session** | **Application** | Data | Managing sessions and controlling communication dialogues |
| 4 | **Transport** | **Transport** | **Segment** | End-to-end reliability, flow control, and port addressing |
| 3 | **Network** | **Internet** | **Packet** | Path determination (Routing) and logical addressing (IP) |
| 2 | **Data Link** | **Network Access** | **Frame** | Media access and physical addressing (MAC) |
| 1 | **Physical** | **Network Access** | Bits | Bit transmission over physical media |

> **Exam Focus:** The TCP/IP **Transport layer** and OSI **Layer 4** provide similar services and functions. The OSI **Application layer** (Layer 7) and the TCP/IP **Application layer** provide identical high-level functions. The TCP/IP **Internet layer** maps to OSI **Layer 3 (Network)** — not to the first three OSI layers.

![osi vs tcp](../../../../../../assets/images/site/learning-cyops4-modele-osi-vs-tcp.webp)

---

## PROTOCOL SUITE BREAKDOWN

The **TCP/IP protocol suite** is the standard for the internet and modern data networks. It is a family of open-standard protocols endorsed by the networking industry.

### Application Layer Protocols

| Category | Protocol | Description |
| :--- | :--- | :--- |
| **Name System** | DNS | Translates domain names (e.g., cisco.com) into IP addresses |
| **Host Config** | DHCPv4 / DHCPv6 | Dynamically assigns IP addressing to clients at startup |
| **Host Config** | SLAAC | Allows a device to obtain IPv6 addressing without a DHCP server |
| **Email** | SMTP | Enables clients to send email to a mail server; enables server-to-server email |
| **Email** | POP3 | Enables clients to retrieve and download email from a mail server |
| **Email** | IMAP | Enables clients to access and manage email stored on a mail server |
| **File Transfer** | FTP | Reliable, connection-oriented file transfer between hosts |
| **File Transfer** | SFTP | Encrypted file transfer using SSH |
| **File Transfer** | TFTP | Simple, connectionless, best-effort file transfer with low overhead |
| **Web** | HTTP | Rules for exchanging text, images, video, and multimedia on the web |
| **Web** | HTTPS | Encrypted form of HTTP |
| **Web** | REST | Web service using APIs and HTTP requests to build web applications |

### Transport Layer Protocols

| Protocol | Type | Description |
| :--- | :--- | :--- |
| **TCP** | Connection-Oriented | Reliable, acknowledged delivery. Confirms successful transmission. |
| **UDP** | Connectionless | Fast, best-effort delivery. Does not confirm successful transmission. |

### Internet Layer Protocols

| Category | Protocol | Description |
| :--- | :--- | :--- |
| **Internet Protocol** | IPv4 | Packages segments into packets; 32-bit addressing |
| **Internet Protocol** | IPv6 | Similar to IPv4; 128-bit addressing — the current standard |
| **Internet Protocol** | NAT | Translates private IPv4 addresses to globally unique public addresses |
| **Messaging** | ICMPv4 / ICMPv6 | Provides error and status feedback between hosts |
| **Routing** | OSPF | Link-state interior routing protocol (open standard) |
| **Routing** | EIGRP | Cisco-developed composite-metric routing protocol |
| **Routing** | BGP | Exterior gateway protocol used between ISPs |

### Network Access Layer Protocols

| Category | Protocol | Description |
| :--- | :--- | :--- |
| **Address Resolution** | ARP | Maps an IPv4 address to a hardware (MAC) address |
| **Data Link** | Ethernet | Defines wiring and signaling standards for the network access layer |
| **Data Link** | WLAN | Defines wireless signaling rules across 2.4 GHz and 5 GHz frequencies |

> **Exam Focus:** ARP is classified at the **Network Access Layer (OSI Layer 2)**, not Layer 3, because its primary purpose is to discover the **MAC address** of a destination — a Layer 2 address. You may encounter documentation placing ARP at Layer 3; in this course, Layer 2 is the correct answer.

![protocols](../../../../../../assets/images/site/learning-cyops4-protocols.webp)

---

## OPERATIONAL ANALYSIS

### Protocol Data Units (PDUs)

As application data is passed down the protocol stack toward the network medium, each layer wraps the data with protocol-specific header information. The form that data takes at each layer is called a **Protocol Data Unit (PDU)**. PDUs are named according to the TCP/IP suite:

| Layer | PDU Name | Key Information Added |
| :--- | :--- | :--- |
| Application | **Data** | User-generated content |
| Transport | **Segment** (TCP) / **Datagram** (UDP) | Source & destination **port numbers** |
| Internet / Network | **Packet** | Source & destination **IP addresses** |
| Network Access / Data Link | **Frame** | Source & destination **MAC addresses** |
| Physical | **Bits** | Electrical, optical, or radio signals |

> **Note:** IP packets are sometimes referred to as IP datagrams. The term "datagram" is technically associated with UDP at the transport layer, but may appear in the context of IP as well.

### Encapsulation and De-encapsulation

As data moves **down** the protocol stack for transmission, each layer adds a header containing protocol-specific information. This process is **encapsulation**.

1. **Application Layer:** Data is generated by the application.
2. **Transport Layer:** Data is encapsulated into a **Segment** or **Datagram**. A **destination port number** is added to identify the target process on the remote host.
3. **Internet/Network Layer:** The segment is encapsulated into a **Packet**. An **IP address** is added to identify the source and destination hosts and networks.
4. **Network Access/Data Link Layer:** The packet is encapsulated into a **Frame**. A **hardware (MAC) address** is added to direct the frame to the correct host on the local network.
5. **Physical Layer:** The frame is converted to **bits** and transmitted over the physical medium.

The reverse process at the receiving host is **de-encapsulation**: each layer strips its respective header and passes the payload up the stack toward the application.

> **Exam Focus — Encapsulation direction:** Segments move from the **Transport layer to the Internet layer** (not the reverse). Data moves from the **Internet layer to the Network Access layer** (not back up). Frames are sent from the **Network Access layer** outward onto the medium — never "up" to the Internet layer.

> **Exam Focus — De-encapsulation order (client receiving a web page):** The correct decoding order from the client's perspective is: **Ethernet → IP → TCP → HTTP**.

### Diagnostic Tooling

| Tool | Purpose |
| :--- | :--- |
| `traceroute` | Identifies the **specific router** where a packet was lost or delayed; shows hop-by-hop path and latency |
| `ipconfig` | Displays the local host's IP configuration |
| `netstat` | Shows active network connections and listening ports |
| `telnet` | Tests TCP connectivity to a remote port (not used for path tracing) |

> **Exam Focus:** To find the router where a packet was **lost or delayed**, use `traceroute` — not `telnet`, `ipconfig`, or `netstat`.

---

## CASE STUDIES & EXAM SPECIFICS

### Critical Distinctions for the Exam

| Topic | Key Point |
| :--- | :--- |
| **Segmentation** | Divides a large data stream into smaller pieces **prior to transmission** — not multiplexing, duplexing, or sequencing |
| **Multiplexing** | Interleaves multiple conversations on the same medium — increases speed and efficiency |
| **Sequencing** | TCP adds sequence numbers so segments can be **reassembled in the correct order** |
| **Broadcast** | Transmitted to **all hosts in the same network** — not to all hosts on the internet |
| **Broadcast vs. Multicast** | Multicast targets a **defined group**; broadcast targets **all hosts** in a network |
| **Flow Control** | Prevents a sender from **overwhelming** a receiver — the correct method to avoid dropped packets |
| **Message Encoding** | Converting information to the **appropriate form for transmission** — not interpretation or segmentation |
| **ARP** | Operates at **Network Access Layer (OSI Layer 2)** — discovers MAC addresses |
| **Process-to-Process** | Handled by the **Application Layer** (OSI Layer 7 / TCP/IP Application layer) |
| **Port Numbers** | Added at the **Transport Layer** during encapsulation |
| **IP Addresses** | Added at the **Internet/Network Layer** during encapsulation |
| **MAC Addresses** | Added at the **Data Link/Network Access Layer** during encapsulation |
| **Frames** | Created at the **Data Link / Network Access Layer** |
| **`traceroute`** | Identifies **where** on the path a packet was lost or delayed |
| **BYOD** | Provides **flexibility in where and how** users access network resources |
| **Cloud Computing** | Applications accessible **over the internet, from any device, anywhere** |
| **TCP/IP vs. OSI mapping** | TCP/IP Transport ↔ OSI Layer 4 · TCP/IP Internet ↔ OSI Layer 3 · TCP/IP Application ↔ OSI Layers 5–7 |
| **Encapsulation process** | Segments → Transport; Packets → Internet; Frames → Network Access |
| **De-encapsulation order** | Ethernet → IP → TCP → HTTP (client receiving a web page) |