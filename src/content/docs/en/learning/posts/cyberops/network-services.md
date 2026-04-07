---
title: "Network Services and Protocol Analysis for Cisco CyberOps"
description: "A high-level technical analysis of transport layer protocols (TCP/UDP), infrastructure services (DNS, DHCP, NAT), and application layer security (HTTP/HTTPS) as required for the Cisco CyberOps Associate certification."
order: 10
---

## 1. DHCP — Dynamic Host Configuration Protocol

**DHCP** automates the assignment of IPv4 addresses, subnet masks, default gateways, and other network parameters to hosts on a network — this is called *dynamic addressing*.

> **Static vs Dynamic addressing:**  
> - **Static:** Administrator manually configures each device (used for servers, routers, printers).  
> - **Dynamic (DHCP):** Addresses are automatically assigned from a pool — preferred for large/changing networks.

### DHCP Operation (DORA Process)

The DHCP lease is negotiated via 4 messages:

| Step | Message | Direction | Description |
|------|---------|-----------|-------------|
| 1 | **DHCPDISCOVER** | Client → Broadcast | Client seeks available DHCP servers |
| 2 | **DHCPOFFER** | Server → Client | Server offers an IP address + config |
| 3 | **DHCPREQUEST** | Client → Broadcast | Client accepts an offer from a specific server |
| 4 | **DHCPACK** | Server → Client | Server confirms the lease |
| — | **DHCPNAK** | Server → Client | Sent if the offered address is no longer available |
| — | **DHCPRELEASE** | Client → Server | Client releases the IP address |

> After the lease period expires, the address returns to the DHCP pool for reuse.

### DHCP Transport Details

- DHCPv4 messages are encapsulated in **UDP**
- **Client → Server:** UDP source port **68**, destination port **67**
- **Server → Client:** UDP source port **67**, destination port **68**

### DHCPv6 Messages

| DHCPv6 Message | Equivalent DHCPv4 Message |
|----------------|--------------------------|
| SOLICIT | DHCPDISCOVER |
| ADVERTISE | DHCPOFFER |
| REQUEST / INFORMATION REQUEST | DHCPREQUEST |
| REPLY | DHCPACK |

### Wireshark Filter

```
bootp
```

---

## 2. DNS — Domain Name System

**DNS** translates human-readable domain names (e.g., `www.cisco.com`) into IP addresses (e.g., `74.163.4.161`). It is a globally distributed, hierarchical system.

> ⚠️ **Security note:** Over **90% of malicious software** exploits the DNS system to carry out network attack campaigns. Malware frequently contacts command-and-control (C2) servers via DNS.

### DNS Domain Hierarchy

```
.                          ← Root
└── .com / .org / .net     ← Top-Level Domains (TLD)
    └── cisco              ← Second-Level Domain
        └── www            ← Subdomain / Hostname
```

Common TLDs:

| TLD | Type |
|-----|------|
| `.com` | Commercial / Business |
| `.org` | Non-profit organization |
| `.gov` | US Government |
| `.edu` | Educational institution |
| `.au`, `.fr`, `.uk` | Country-code TLDs (ccTLD) |

### Key DNS Terminology

| Term | Definition |
|------|-----------|
| **Resolver** | A DNS client that sends DNS queries |
| **Authoritative Server** | Server that holds the definitive RRs for a domain |
| **Recursive Resolver** | DNS server that queries on behalf of a resolver |
| **FQDN** | Fully Qualified Domain Name (e.g., `www.cisco.com.`) |
| **RR (Resource Record)** | Entry in DNS with fields: NAME, TYPE, CLASS, TTL, RDATA |
| **Zone** | A portion of the DNS namespace managed by an authoritative server |
| **Zone Transfer** | Process of replicating DNS zone data between servers |

### DNS Record Types

| Record | Description |
|--------|-------------|
| **A** | IPv4 address of a host |
| **AAAA** | IPv6 address of a host (quad-A) |
| **NS** | Authoritative name server for a domain |
| **MX** | Mail exchange record |
| **CNAME** | Canonical name / alias |
| **PTR** | Reverse lookup (IP → hostname) |
| **TXT** | Text record (used for SPF, DKIM, etc.) |

### DNS Resolution Steps

1. User enters FQDN in browser
2. Client checks its **local DNS cache** first
3. If no match → DNS query sent to configured DNS server
4. DNS server matches name to IP (or queries higher-level servers recursively)
5. Response sent back to client with resolved IP
6. Client contacts the web server using the resolved IP

> On Windows, use `ipconfig /displaydns` to view the local DNS cache.

### DNS Message Format

DNS uses a single message format for queries and responses:

| Section | Description |
|---------|-------------|
| **Question** | Domain to resolve, query type, class |
| **Answer** | RR(s) with resolved IP(s) |
| **Authority** | RRs for the authoritative server |
| **Additional** | Extra RRs to improve resolution efficiency |

### DNS Transport

| Condition | Protocol | Port |
|-----------|----------|------|
| Standard queries & responses | **UDP** | **53** |
| Responses > 512 bytes (e.g., DDNS) | **TCP** | **53** |

> DNS uses UDP because queries are small and don't require connection overhead. UDP is faster and efficient for short exchanges.

### Dynamic DNS (DDNS)

**DDNS** allows near-instantaneous updates to IP-to-domain mappings — critical when ISPs use DHCP and IP addresses change frequently.

- A **DDNS client** (on router or host) detects IP changes and notifies the DDNS provider immediately
- Commonly used for home servers, self-hosted services

> ⚠️ **Security risk:** Threat actors abuse **free DDNS services** to quickly rotate IP addresses for malware C2 servers, evading IP blocklists. Monitor DNS traffic to known DDNS services.

### WHOIS Protocol

- **TCP-based** protocol to identify owners of internet domains
- Query format: FQDN → returns registrant information
- Tool: [ICANN Lookup](https://lookup.icann.org)
- Useful for identifying potentially malicious internet destinations
- **Limitation:** Threat actors use privacy services to obscure their identity

### Wireshark Filter for DNS

```
dns
```

---

## 3. NAT — Network Address Translation

**NAT** translates private IPv4 addresses to public addresses, enabling internal hosts to communicate with external networks (internet).

### Why NAT?

IPv4 private address space (RFC 1918) cannot be routed on the internet:

| Class | Private Range | CIDR |
|-------|-------------|------|
| A | 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 |
| B | 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 |
| C | 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 |

### NAT Terminology (Cisco)

| Term | Description |
|------|-------------|
| **Inside Local** | Real (private) IP of the internal host |
| **Inside Global** | Public IP of the internal host as seen from the internet |
| **Outside Local** | IP of the external destination as seen from the internal network |
| **Outside Global** | Real IP of the external destination on the internet |

> 💡 External users reach internal hosts using the **Inside Global** address.

### Port Address Translation (PAT / NAT Overload)

**PAT** maps multiple private addresses to a single public address using unique **port numbers** to track sessions. This is the most common form of NAT (used by home routers).

```
Internal Host A: 192.168.1.10:5001  →  203.0.113.1:10001 (NAT)
Internal Host B: 192.168.1.11:5002  →  203.0.113.1:10002 (NAT)
```

PAT adds security by validating that incoming packets were requested.

---

## 4. File Transfer & Sharing Services

### FTP — File Transfer Protocol

- Application layer protocol for file transfers between client and server
- Uses **two TCP connections**:
  - **Port 21** — Control connection (commands & replies)
  - **Port 20** — Data connection (actual file transfer)
- Credentials and data are transmitted in **plaintext** (insecure)

> The FTP server listens on **port 21** for control traffic initiated by FTP clients.

### SFTP — SSH File Transfer Protocol

- Secure version of FTP using **SSH** for encryption
- Operates over **TCP port 22**
- Provides authentication, integrity, and confidentiality

### TFTP — Trivial File Transfer Protocol

- Simplified file transfer protocol
- Uses **UDP port 69** — no authentication, no directory listing
- Fundamentally **insecure** — used only in trusted environments (e.g., router IOS upgrades)

### SMB — Server Message Block

- Client/server file sharing protocol for sharing directories, files, printers, and serial ports
- The backbone of **Microsoft Windows network file sharing**
- Uses **TCP ports 139 / 445**

### File Transfer Protocol Comparison

| Protocol | Transport | Port(s) | Security | Use Case |
|----------|-----------|---------|----------|----------|
| FTP | TCP | 20, 21 | None (plaintext) | General file transfer |
| SFTP | TCP | 22 | SSH encrypted | Secure file transfer |
| TFTP | UDP | 69 | None | Network device bootstrap |
| SMB | TCP | 139, 445 | Optional (SMBv3) | Windows file sharing |

---

## 5. Email Services

Email uses three separate protocols for different operations:

| Protocol | Role | Port | Transport |
|----------|------|------|-----------|
| **SMTP** | Sending email (client → server, server → server) | 25 / 587 | TCP |
| **POP3** | Retrieving email — **downloads and deletes** from server | 110 / 995 (SSL) | TCP |
| **IMAP** | Retrieving email — **keeps mail on server**, syncs across devices | 143 / 993 (SSL) | TCP |

> ✉️ **POP3** downloads mail to the client and removes it from the server.  
> ✉️ **IMAP** is preferred for multi-device access — mail stays on the server.

---

## 6. HTTP & HTTPS

### HTTP — HyperText Transfer Protocol

- Application layer protocol for web communication
- Uses **TCP port 80**
- **Request/Response** model: client sends requests, server sends responses

#### HTTP Request Methods

| Method | Description |
|--------|-------------|
| **GET** | Request a resource from the server |
| **POST** | Submit data to be processed (e.g., form data) |
| **PUT** | Upload or replace a resource |
| **DELETE** | Delete a resource |
| **OPTIONS** | Query supported methods |
| **CONNECT** | Establish a tunnel (used for HTTPS proxying) |

#### HTTP Response Status Codes

| Group | Range | Meaning |
|-------|-------|---------|
| Informational | 1xx | Request received, processing |
| Success | 2xx | Request successfully completed |
| Redirection | 3xx | Further action needed |
| Client Error | 4xx | Bad request (e.g., 404 Not Found) |
| Server Error | 5xx | Server failed to fulfill request |

#### HTTP URL Structure

```
http://www.example.com:8080/path/page.html?query=value#section
  │        │               │    │              │         │
scheme   hostname         port  path          query    fragment
```

> ⚠️ HTTP transmits all data in **plaintext** — credentials and session data are fully visible in packet captures.

### HTTPS — HTTP Secure

- Uses **TCP port 443**
- Encrypts data with **TLS** (Transport Layer Security) or SSL
- Provides **authentication**, **integrity**, and **confidentiality**
- HTTP/2 requires HTTPS (TLS 1.2+) in all major browsers

> ⚠️ **HTTPS ≠ Trustworthy.** Threat actors also use HTTPS to hide malicious activity. Just because a site uses HTTPS does not guarantee it is safe.

### HTTP vs HTTPS

| Feature | HTTP | HTTPS |
|---------|------|-------|
| Port | 80 | 443 |
| Encryption | None | TLS/SSL |
| Authentication | None | Certificate-based |
| Data visible in capture | Yes (plaintext) | No (encrypted) |
| Security | Insecure | Secure |
| Use case | Legacy, internal | All modern web traffic |

### Wireshark Filters

```
http          # Filter HTTP traffic
tcp.port==443 # Filter HTTPS traffic
```

---

## 7. Transport Protocols: TCP vs UDP

Most network services rely on either TCP or UDP at the transport layer.

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | Guaranteed delivery, retransmission | Best-effort, no retransmission |
| Order | Ordered delivery | No ordering |
| Error checking | Yes (ACK, sequence numbers) | Checksum only |
| Speed | Slower (overhead) | Faster (less overhead) |
| Header size | 20–60 bytes | 8 bytes |
| Use case | FTP, HTTP, HTTPS, SMTP, SSH | DNS, DHCP, TFTP, streaming |

### TCP Three-Way Handshake

```
Client          Server
  │──── SYN ────►│
  │◄── SYN-ACK ──│
  │──── ACK ────►│
  │   Connected  │
```

### TCP Header Fields

| Field | Description |
|-------|-------------|
| Source Port | Ephemeral port of the initiating host (>1023) |
| Destination Port | Well-known port of the service (0–1023) |
| Sequence Number | Number of the last octet in this segment |
| Acknowledgment Number | Next expected octet from the receiver |
| Flags (SYN/ACK/FIN) | Session management bits |
| Window Size | Flow control — octets that can be sent before ACK |
| Urgent Pointer | Used with URG flag only |

### TCP Session Termination (4-way)

```
Client          Server
  │◄──── FIN ────│   Server has no more data
  │───── ACK ───►│
  │───── FIN ───►│   Client terminates its side
  │◄──── ACK ────│
  │   Closed     │
```

### UDP Header Fields

| Field | Size | Description |
|-------|------|-------------|
| Source Port | 16 bits | Port of the sending application |
| Destination Port | 16 bits | Port of the receiving application |
| Length | 16 bits | Total length of UDP segment (header + data) |
| Checksum | 16 bits | Error detection (optional in IPv4) |

> UDP has **low overhead** because it lacks connection management fields. Any reliability must be handled by the application layer.

---

## 8. Wireshark — Protocol Analysis

Wireshark is an open-source packet capture and analysis tool. Understanding how to filter and interpret captures is a core cybersecurity analyst skill.

### Essential Wireshark Filters

| Protocol | Filter |
|----------|--------|
| DNS | `dns` |
| DHCP | `bootp` |
| HTTP | `http` |
| HTTPS | `tcp.port==443` |
| FTP | `ftp` |
| TFTP | `tftp` |
| TCP (specific host) | `tcp and ip.addr==<IP>` |
| UDP | `udp` |

### Wireshark Panes

| Pane | Description |
|------|-------------|
| **Packet List** (top) | One row per captured frame |
| **Packet Details** (middle) | Expandable protocol fields |
| **Packet Bytes** (bottom) | Raw hex + ASCII of the frame |

### Capturing with tcpdump (CLI)

```bash
# Capture on interface enp0s3, save to file
sudo tcpdump -i enp0s3 -s 0 -w capture.pcap

# Options:
# -i  : specify interface
# -s 0: capture full packet (default 262144 bytes)
# -w  : write to .pcap file
```

Open the resulting `.pcap` file in Wireshark for GUI analysis.

### DNS Capture Analysis

A DNS query packet (UDP, port 53) structure in Wireshark:

```
Frame (74 bytes)
└── Ethernet II
    ├── Source MAC: [VM NIC]
    └── Destination MAC: [Default Gateway]
        └── IPv4
            ├── Source IP: [Client IP]
            └── Destination IP: [DNS Server, e.g., 8.8.4.4]
                └── UDP
                    ├── Source Port: [Ephemeral, e.g., 58029]
                    └── Destination Port: 53
                        └── DNS Query
                            └── A record for www.google.com
```

> In the DNS **response**, source and destination roles are **reversed**: DNS server responds from port 53 to the client's ephemeral port.

### HTTP vs HTTPS in Wireshark

| Observation | HTTP Capture | HTTPS Capture |
|-------------|-------------|---------------|
| Readable content | Yes — credentials visible in POST | No — encrypted payload |
| Protocol section visible | `HTTP` layer visible | `TLS`/`Encrypted Application Data` |
| Filter | `http` | `tcp.port==443` |
| POST form data | Visible in `HTML Form URL Encoded` | Not visible |

---

## 9. Key Ports Reference

| Port | Protocol | Service |
|------|----------|---------|
| 20 | TCP | FTP Data |
| 21 | TCP | FTP Control |
| 22 | TCP | SSH / SFTP |
| 23 | TCP | Telnet |
| 25 | TCP | SMTP |
| 53 | UDP/TCP | DNS |
| 67 | UDP | DHCP Server |
| 68 | UDP | DHCP Client |
| 69 | UDP | TFTP |
| 80 | TCP | HTTP |
| 110 | TCP | POP3 |
| 143 | TCP | IMAP |
| 443 | TCP | HTTPS |
| 445 | TCP | SMB |
| 587 | TCP | SMTP (submission) |
| 993 | TCP | IMAPS (IMAP over SSL) |
| 995 | TCP | POP3S (POP3 over SSL) |

---

## 10. Practice Questions

> ✅ = Correct answer

**Q1. Which message does an IPv4 host use to reply when it receives a DHCPOFFER?**
- DHCPDISCOVER
- ✅ **DHCPREQUEST**
- DHCPACK
- DHCPOFFER

**Q2. Which protocol automates IP address assignment, and which port does it use?**
- ✅ **DHCP**
- ✅ **Port 67**
- DNS / Port 53
- SMB / Port 80

**Q3. What command shows cached DNS entries on Windows?**
- `arp -a`
- `ipconfig /all`
- ✅ **`ipconfig /displaydns`**
- `nslookup`

**Q4. What type of server uses IMAP?**
- DNS
- DHCP
- FTP
- ✅ **Email**

**Q5. What is a benefit of DDNS?**
- ✅ **The DDNS provider detects a change to the client IP address and immediately updates the mapping.**
- DDNS is a more secure version of DNS.
- DDNS uses ICANN Lookup for URL registration.
- DDNS identifies dangerous internet locations.

**Q6. Which application layer protocol uses GET, PUT, and POST methods?**
- SMTP
- POP3
- DHCP
- ✅ **HTTP**

**Q7. Which protocol downloads email and deletes it from the server?**
- SMTP
- IMAP
- ✅ **POP3**
- HTTP

**Q8. Which website is considered secure due to encryption?**
- `ftp://download.openproject.net/`
- `http://www.thebanks.com/`
- ✅ **`https://www.ourblogs.info/`**
- `http://www.secureaccess.com:8080/`

**Q9. Which describes FTP operation correctly?**
- ✅ **An FTP server uses source port 21 for control traffic with FTP clients.**
- FTP client uses source port 21 for control traffic.
- FTP client uses source port 20 for data traffic.
- FTP server uses source port 20 for control traffic.

**Q10. In NAT, what address do external users use to reach internal hosts?**
- Inside Local
- ✅ **Inside Global**
- Outside Local
- Outside Global

**Q11. Which application layer protocol describes file sharing services in Microsoft networks?**
- SMTP
- DHCP
- DNS
- ✅ **SMB**

**Q12. How does TCP manage communication differently than UDP?**

> TCP establishes a connection via a 3-way handshake (SYN, SYN-ACK, ACK) before transmitting data, ensuring reliable, ordered delivery with acknowledgments. UDP is connectionless — it sends data without setup or confirmation, making it faster but less reliable. TCP is used for HTTP, FTP, SMTP (where data integrity matters); UDP is used for DNS, DHCP, TFTP (where speed matters more than reliability).

---

*Sources: Cisco NetAcad CyberOps / CCNA Module 10 — Network Services; Wireshark Labs 10.2.7, 10.4.3, 10.6.7*
