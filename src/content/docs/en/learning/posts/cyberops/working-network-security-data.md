---
title: "SIO - CyberOps Associate: Network Threat Analysis and Investigation"
description: "Advanced technical training module covering security data normalization, PCAP analysis, regular expressions usage, malware investigation, compromised host isolation via the 5-tuple, and interpretation of HTTP/DNS data in a SOC context equipped with Security Onion, ELK Stack, Sguil, Wireshark, and Zeek."
order: 27
---

# SIO - CyberOps Associate

---

## CORE CONCEPTS & DEFINITIONS

### 1. Data Normalization

**Normalization** is the process of converting data from heterogeneous sources into a common, standardized format. In the NSM (Network Security Monitoring) context, it ensures consistency of data fields (timestamps, IP addresses, MAC addresses) to enable effective searches and correlations in a SIEM.

Without normalization, the same IPv6 address may appear in four distinct forms across logs from different sources:

```
2001:db8:acad:1111:2222::33
2001:DB8:ACAD:1111:2222::33
2001:DB8:ACAD:1111:2222:0:0:33
2001:DB8:ACAD:1111:2222:0000:0000:0033
```

Similarly, timestamps may coexist in the following formats:

```
Unix Epoch    : 1498656439
Human Readable: Wed, 28 Jun 2017 13:27:19 GMT
ISO 8601      : 2017-06-28T13:27:19+00:00
```

**Unix Epoch** is preferred for algorithmic processing (comparisons, intervals). **Human Readable** format is preferred for direct human analysis.

**Logstash** handles this transformation via ETL (Extract, Transform, Load) pipelines before indexing into Elasticsearch. Additional plugins can be developed for proprietary schemas.

---

### 2. NSM Data Reduction

**Data reduction** consists of identifying and eliminating traffic flows and log entries that provide no analytical security value. Categories typically excluded are:

- Encrypted traffic that cannot be decrypted (IPsec, TLS/SSL without inspection)
- Routing protocol traffic (OSPF, BGP, STP)
- Routine broadcast and multicast traffic
- Low-severity HIDS alerts (informational, low impact)
- Low-priority syslog entries (severity levels 6 and 7)

The goal is to maximize the **signal-to-noise ratio** in analysis tools such as Elasticsearch.

---

### 3. The AWK Tool for Log Manipulation

**AWK** is a programming language oriented toward processing column-structured text, particularly suited to delimited log files. Its main syntax is:

```bash
awk 'BEGIN {FS=OFS="|"} {$3=strftime("%c",$3)} {print}' applicationX_in_epoch.log
```

**Element breakdown:**

| Element | Function |
|---|---|
| `awk` | Invokes the AWK interpreter |
| `BEGIN {}` | Initialization block executed before line processing |
| `FS=OFS="|"` | Defines the Field Separator and Output Field Separator |
| `$3` | References the value of the 3rd column in the current line |
| `strftime("%c",$3)` | Converts an Epoch timestamp to a human-readable format |
| `gsub(/\[|\]/,"",$4)` | Global substitution: removes brackets `[` and `]` from field 4 |
| `{print}` | Prints the current line after transformation |

**Critical note:** An empty line in a log file processed by `strftime()` produces the result `||Wed 31 Dec 1969 07:00:00 PM EST`, because Epoch value `0` corresponds to the Unix origin (January 1, 1970 00:00:00 UTC). This behavior is an indicator of malformed data or spurious empty lines.

---

### 4. Regular Expressions (Regex)

A **regular expression (regex)** is a symbolic pattern that describes a set of character strings to be identified in a search or filtering operation. Two standards coexist: **POSIX** and **Perl**.

#### Fundamental Metacharacters

| Metacharacter | Description |
|---|---|
| `.` | Matches any single character |
| `*` | Zero or more occurrences of the preceding element |
| `^` | Start of line |
| `$` | End of line |
| `[abc]` | Character class: matches `a`, `b`, or `c` |
| `\d` | Matches a decimal digit (0-9) |
| `\D` | Matches any non-numeric character |
| `\.` | Matches the literal dot character (escaped) |
| `{m}` | Exactly `m` occurrences |
| `{n,m}` | Between `n` and `m` occurrences |
| `abc\|123` | Alternation: matches `abc` or `123` |

#### Example Patterns Applied to Security Logs

| Regex Pattern | Interpretation |
|---|---|
| `^83` | Lines beginning with `83` |
| `[A-Z]{2,4}` | Sequence of 2 to 4 consecutive uppercase letters |
| `05:22:2[0-9]` | Timestamps between 05:22:20 and 05:22:29 |
| `\.com` | The suffix `.com` as a literal string |
| `complete\|GET` | The string `complete` or the HTTP method `GET` |
| `0{4}` | Sequence of four consecutive zeros |

In **Kibana (Elasticsearch)**, regular expressions are wrapped in slashes (`/regex/`) in Query DSL queries:

```json
/d[ao]n/       -> matches "dan" and "don"
/<.+>/         -> matches any content resembling an HTML tag
```

---

### 5. Extracting Executables from a PCAP

A PCAP capture contains the entirety of packets from a network session, including transported application data. In the case of an HTTP malware transfer, **Wireshark** allows reconstructing the TCP stream and extracting the transferred file.

**Extraction procedure:**

```
File > Export Objects > HTTP
```

This feature analyzes HTTP PDUs in the selected stream and lists identifiable application objects (HTML files, PE executables, archives, etc.).

**File type identification:**

The `file` command under Linux analyzes **magic bytes** (binary signature) at the beginning of a file:

```bash
$ file W32.Nimda.Amm.exe
W32.Nimda.Amm.exe: PE32+ executable (console) x86-64, for MS Windows
```

The **PE32+** format identifies a 64-bit Windows executable in Portable Executable format.

**Hash calculation for malware identification:**

```bash
$ sha256sum test1.exe
2a9b0ed40f1f0bc0c13ff35d304689e9cadd633781cbcad1c2d2b92ced3f1c85  test1.exe

$ sha1sum suspicious_file.swf
97a8033303692f9b7618056e49a24470525f7290  suspicious_file.swf
```

Hash values (SHA-1, SHA-256, MD5) serve as **malware signatures**: a match in threat intelligence databases (VirusTotal, Cisco Talos File Reputation) confirms the identification of the malicious file.

---

### 6. The 5-Tuple as an Identification Vector

The **5-tuple** is the set of five parameters that uniquely identify a network session at the network and transport layers:

| Component | Description |
|---|---|
| Source IP Address | IPv4/IPv6 address of the sending host |
| Source Port Number | Source TCP/UDP port (ephemeral on the client side) |
| Destination IP Address | IPv4/IPv6 address of the destination host |
| Destination Port Number | Destination TCP/UDP port (listening service) |
| Protocol | Transport protocol identified in the IP header (TCP=6, UDP=17, ICMP=1) |

In security investigation, the 5-tuple enables:
- Correlating NIDS alerts with corresponding PCAP flows
- Precisely identifying the compromised host and the attacking host
- Pivoting between tools (Sguil → Wireshark → Kibana) based on a consistent flow identifier

---

### 7. Exploit Kits

An **Exploit Kit (EK)** is a malicious framework distributed as a service (Crimeware-as-a-Service) that automates the exploitation of known vulnerabilities in web browsers and their plugins (Flash, Java, PDF readers). The most documented EKs include **RIG EK**, **Angler EK**, **Nuclear EK**.

**Mechanism of a drive-by attack via EK:**

1. The user accesses a compromised legitimate website
2. An invisible `<iFrame>` tag in the HTML loads content from a redirect server
3. A JavaScript script identifies browser vulnerabilities and selects the appropriate exploit
4. The payload (shellcode, dropper) is silently downloaded and executed
5. A **Remote Access Trojan (RAT)** or other malware is installed, establishing C2 (Command & Control) communication

---

### 8. SQL Injection and DNS Exfiltration

**SQL injection** is a code injection attack technique in which a malicious actor inserts SQL instructions into input parameters of a web application that are not properly validated:

```
username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

The keywords `UNION` and `SELECT` are standard SQL commands used to merge results from two queries and extract data from arbitrary tables.

**DNS exfiltration** exploits the DNS protocol to encode and transmit confidential data outside the network perimeter. Data is hexadecimal-encoded and inserted into subdomains of DNS queries:

```
434f4e464944454e5449414c.ns.example.com  ->  CONFIDENTIAL
```

This technique is difficult to detect because DNS (UDP/53) is generally allowed through firewalls and generates significant traffic volumes under normal conditions. Decoding is performed with the `xxd` command:

```bash
$ xxd -r -p "DNS - Queries.csv" > secret.txt
$ cat secret.txt
CONFIDENTIAL DOCUMENT
DO NOT SHARE
```

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Security Onion Architecture — Components and Roles

| Component | Type | Primary Function | Processed Data |
|---|---|---|---|
| **Elasticsearch** | Search engine / SIEM | Storage, indexing, near-real-time analysis | JSON indices (inverted index) |
| **Logstash** | ETL Pipeline | Log ingestion, normalization, transformation | All raw log formats |
| **Kibana** | Visualization interface | Queries, dashboards, investigation | Indexed Elasticsearch data |
| **Beats** | Collection agents | Sending operational data to Elasticsearch | Metrics, logs, network traffic |
| **Snort/Suricata** | NIDS | Signature-based network intrusion detection | Real-time network packets |
| **Zeek (Bro)** | Network analyzer | Connection and protocol log generation | Network flows (HTTP, DNS, FTP, SSL...) |
| **OSSEC** | HIDS | Host system parameter monitoring | Processes, registry, system files |
| **Sguil** | SOC console | Alert aggregation, workflow management | NIDS, HIDS alerts |
| **CapME!** | Transcription interface | PCAP transaction visualization | PCAP files |
| **NetworkMiner** | Network forensics tool | Artifact extraction from PCAP | PCAP files |

---

### ELK Data Types — Supported Formats

| Category | Types | Examples |
|---|---|---|
| **Core Datatypes** | Text, Numeric, Date, Boolean, Binary, Range | Strings, timestamps, integers |
| **Complex Datatypes** | Object (JSON), Nested (JSON arrays) | Nested documents, object arrays |
| **Geo Datatypes** | Geo-point, Geo-shape | Latitude/longitude, geographic polygons |
| **Specialized Datatypes** | IP addresses, Token count, Histogram | IPv4/IPv6 addresses, token counts |

---

### Beats Agents — Classification by Usage

| Agent | Primary Usage | Collected Data |
|---|---|---|
| **Auditbeat** | System auditing | Linux/Windows audit data |
| **Metricbeat** | Infrastructure monitoring | CPU, memory, disk metrics |
| **Heartbeat** | Service availability | Service uptime status |
| **Packetbeat** | Network monitoring | Application-layer network traffic |
| **Journalbeat** | Linux system logs | systemd journals |
| **Winlogbeat** | Windows events | Windows Event Log |

---

### Elasticsearch Query Methods (Query DSL)

| Method | Syntax | Use Case |
|---|---|---|
| **URI Search** | `http://localhost:9200/_search?q=query:ns.example.com` | Simple queries via browser or script |
| **cURL** | `curl "localhost:9200/_search?q=query:ns.example.com"` | CLI automation |
| **JSON / Query DSL** | JSON body with `{"query": {...}}` | Structured complex queries |
| **Kibana Dev Tools** | Interactive Kibana console | Query development and testing |

---

### Kibana Query Operators

| Operator | Syntax | Example |
|---|---|---|
| **Boolean** | AND, OR, NOT | `"php" OR "zip" OR "exe"` |
| **Fields** | `field: value` | `dst.ip: "192.168.1.5"` |
| **Inclusive ranges** | `[val1 TO val2]` | `host:[1 TO 255]` |
| **Exclusive ranges** | `{val1 TO val2}` | `TTL:{100 TO 400}` |
| **Multi-char wildcard** | `*` | `Pas*` (→ Pass, Passwd, Password) |
| **Single-char wildcard** | `?` | `P?ssw?rd` (→ Password, P@ssw0rd) |
| **Regex** | `/pattern/` | `/d[ao]n/` (→ dan, don) |
| **Fuzzy** | `term~n` | `term~2` (Levenshtein distance 2) |

---

### IDS Alert Classification by Category (Security Onion)

| Alert Category | Description | Example Event Message |
|---|---|---|
| **ATTACK_RESPONSE** | Response indicating successful exploitation | `GPL ATTACK_RESPONSE id check returned root` |
| **ET TROJAN** | Known Trojan horse detection | `ET TROJAN ABUSE.CH SSL Blacklist Malicious SSL certificate detected (Dridex)` |
| **ET CURRENT_EVENTS** | Active exploitation based on recent signatures | `ET CURRENT_EVENTS RIG EK URI Struct Mar 13 2017 M2` |
| **ET CURRENT_EVENTS EK Landing** | Exploit kit landing page | `ET CURRENT_EVENTS RIG EK Landing Sep 12 2016 T2` |
| **Remcos RAT Checkin** | RAT command-and-control communication | `Remcos RAT Checkin 23` |

---

## OPERATIONAL ANALYSIS

### SOC Investigation Methodology — Multi-Tool Pivot

Security incident investigation in Security Onion follows a **progressive pivot** process between tools, from the most general (Kibana dashboard) to the most granular (PCAP Wireshark):

```
Kibana Dashboard (macro view)
        |
        v
Sguil (correlated NIDS/HIDS alerts)
        |
        v
CapME! / Transcript (application session reading)
        |
        v
Wireshark (packet-level analysis, object extraction)
        |
        v
NetworkMiner / sha256sum / file (forensic analysis)
        |
        v
VirusTotal / Cisco Talos (external threat intelligence)
```

---

### Procedure: Compromised Host Isolation via the 5-Tuple

**Step 1 — Initial alert identification in Sguil**

```
Event Message: GPL ATTACK_RESPONSE id check returned root
Source IP    : 209.165.200.235
Destination  : 209.165.201.17
Alert ID     : 5.1
```

**Step 2 — Transcript analysis (Follow TCP Stream)**

The Sguil transcript displays:
- Text in **red**: data transmitted by the attacker (SRC)
- Text in **blue**: responses from the target (DST)

The presence of Linux commands in the TCP session (e.g., `whoami`, `cat /etc/passwd`, `ls -la`) indicates **remote command execution** on the target, confirming that root access was obtained.

**Step 3 — Pivot to Kibana for log correlation**

Filter by source IP in Kibana (Zeek Hunting > Files), identify the FTP protocol in the **Sensors Pie Chart**, and filter `bro_ftp` to isolate FTP transfers:

```
ftp_argument: ftp://209.165.200.235/./confidential.txt
```

**Step 4 — Reconstruction of the exfiltrated file**

Via Kibana Zeek Files, filter `FTP_DATA` to identify the MIME type and content of the transferred file. The `alert_id` field allows pivoting to the FTP session transcript.

**Step 5 — Remediation recommendations**

- Immediately change root and analyst credentials
- Block the source IP at the perimeter firewall
- Audit FTP and SSH service ACLs
- Apply patches related to the exploited CVE

---

### Procedure: Malware Analysis via Drive-By Attack (RIG Exploit Kit)

**Step 1 — Temporal localization in Kibana**

Narrow the time range in Kibana (Absolute Time Range) around the known incident period (January 2017). Navigate to the NIDS Dashboard and zoom in on the alert spike.

**Step 2 — First NIDS event analysis**

```
Event Message    : ET CURRENT_EVENTS RIG EK URI Struct Mar 13 2017 M2
Source IP        : <Internal victim host>
Destination      : <External EK server>
Destination Port : 80 (HTTP)
Classification   : A Network Trojan was Detected
```

**Step 3 — HTTP stream reconstruction in CapME!/Wireshark**

In the CapME! transcript:
- `SRC: REFERER` = initial legitimate website visited (e.g., `www.homeimprovement.com`)
- `SRC: HOST` = malicious server to which the browser was redirected (e.g., `tybenme.com`)
- The requested content is a **SWF** (Adobe Shockwave Flash) file — a classic EK exploitation vector

**Step 4 — Artifact extraction and hashing**

```bash
# Extraction from Wireshark: File > Export Objects > HTTP
# SHA-1 identification of the SWF file:
$ sha1sum %3fbiw=SeaMonkey.[...].swf
97a8033303692f9b7618056e49a24470525f7290

# Submission to VirusTotal for identification
# Result: match with known malware family (e.g., Rig.EK.Flash.CVE-2015-xxxx)
```

**Step 5 — HTML file analysis of the compromised page**

The file `remodeling-your-kitchen-cabinets.html` contains two indicators of a drive-by attack:
- In the `<head>`: malicious redirection or fingerprinting script
- In the `<body>`: invisible `<iFrame>` tag pointing to the EK server

---

### Procedure: SQL Injection + DNS Exfiltration Investigation

**SQL Injection — Analysis in Kibana HTTP Dashboard**

Filter on **Zeek Hunting > HTTP**, identify HTTP GET requests containing SQL patterns in the `uri` field:

```
uri: /login.php?username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

The presence of `UNION SELECT` operators in the URI constitutes direct evidence of a SQL injection attempt (successful or not) to exfiltrate data from a database table.

**DNS Exfiltration — Analysis in Kibana DNS Dashboard**

Filter on **Zeek Hunting > DNS**, identify queries with abnormally long subdomains with hexadecimal structure:

```
Query: 434f4e464944454e5449414c.ns.example.com
```

Decoding procedure:

```bash
# Extract hexadecimal data from the Kibana CSV
# Edit the file to isolate only the hexadecimal portion
434f4e464944454e5449414c20444f43554d454e540a...

# Decode with xxd
$ xxd -r -p "DNS - Queries.csv" > secret.txt
$ cat secret.txt
CONFIDENTIAL DOCUMENT
DO NOT SHARE
This document contains information about the last security breach.
```

---

### Procedure: Windows Attack Investigation (Remcos RAT + Dridex)

**Step 1 — Chronological alert analysis in Sguil (3-19-2019)**

All alerts are temporally grouped, indicating an automated attack sequence (infection chain).

**Step 2 — Initial vector identification**

```
Alert 5.439 : DNS Dynamic Update (possible exfiltration or C2 update)
Alert 5.440 : HTTP GET → downloaded PE32 file (magic bytes MZ = Windows PE)
```

**File signatures** allow identifying file type without relying on the extension:

| Magic Bytes (hex) | File Type |
|---|---|
| `4D 5A` (MZ) | Windows PE Executable (.exe, .dll) |
| `50 4B 03 04` (PK) | ZIP Archive / Office Open XML |
| `25 50 44 46` (%PDF) | PDF Document |
| `FF D8 FF` | JPEG Image |
| `43 57 53` / `46 57 53` | Adobe Flash SWF |

**Step 3 — RAT identification via IDS signature**

```
Alert ID   : 5.480
Event Msg  : Remcos RAT Checkin 23
Protocol   : TCP to non-standard port (non-well-known port)
Content    : Encrypted / obfuscated traffic — not readable in plaintext
```

**Remcos** = Remote Control and Surveillance. The RAT establishes an encrypted C2 channel to remotely execute commands, record keystrokes, capture screenshots, and exfiltrate data.

**Step 4 — Correlation with Kibana (Zeek Hunting Dashboards)**

| Zeek Dashboard | Extracted Key Information |
|---|---|
| **HTTP** | URIs of downloaded files, source servers |
| **DNS** | Resolved domains (including potential C2), abnormal queries |
| **SSL / x.509** | Malicious certificates (Dridex SSL Blacklist) |
| **PE** | Portable executables identified in the traffic |
| **Kerberos** | Hostnames and Windows domains involved |
| **SMB** | Accessed network shares (potential lateral movement) |
| **DCE/RPC** | Remote Windows network procedures invoked |
| **Weird** | Protocol anomalies and malformed communications |

---

## CASE STUDIES & EXAM SPECIFICS

### Case Study 1: Compromise via FTP Root Access

**Scenario:** After an attack, the `confidential.txt` file is no longer accessible on the target server.

**Exploitation chain:**
1. Exploitation of a documented vulnerability → obtaining a root shell
2. Execution of Linux commands via the TCP session (`whoami` returns `root`)
3. Use of **FTP** protocol to copy and exfiltrate `confidential.txt`
4. Deletion of the file on the target after exfiltration

**Key exam points:**
- The alert `GPL ATTACK_RESPONSE id check returned root` means that the `id` command returned `uid=0(root)` — proof of privilege escalation
- The FTP protocol generates two flows: `ftp` (control, port 21) and `ftp-data` (data, port 20 in active mode or dynamic port in passive mode)
- In Zeek/Kibana, FTP is logged under `bro_ftp` for control and `FTP_DATA` for data transfer

---

### Case Study 2: Infection via RIG Exploit Kit

**Scenario:** A user visiting a legitimate home improvement website is redirected to an EK.

**Technical sequence:**
1. Connection to `www.homeimprovement.com` (compromised legitimate site)
2. HTML contains an invisible iFrame → redirect to EK server (`tybenme.com`)
3. The EK server delivers a SWF file exploiting a Flash Player vulnerability (CVE)
4. The executed shellcode downloads an additional payload (dropper)
5. The dropper installs the final malware and establishes C2 communication

**Key exam points:**
- A SWF file is identified by its magic bytes `43 57 53` (CWS) or `46 57 53` (FWS) at the beginning of the file
- The SHA-1 value `97a8033303692f9b7618056e49a24470525f7290` corresponds to the malicious SWF file identified on VirusTotal
- The **NIDS classification** `A Network Trojan was Detected` is distinct from `Attempted Information Leak` or `Policy Violation`
- EKs are delivered as commercial services (Crimeware-as-a-Service) and primarily target unpatched browser vulnerabilities

---

### Case Study 3: Windows Attack — Remcos RAT + Dridex

**Scenario:** A Windows host on the network is compromised on March 19, 2019.

**Indicators of Compromise (IoCs):**
- Download of a PE32 file (MZ header) via HTTP
- SHA256 hash `2a9b0ed40f1f0bc0c13ff35d304689e9cadd633781cbcad1c2d2b92ced3f1c85` identified by Cisco Talos as known malware
- Alert `Remcos RAT Checkin 23` on non-standard C2 port with encrypted/obfuscated traffic
- Alert `ET TROJAN ABUSE.CH SSL Blacklist Malicious SSL certificate detected (Dridex)` from IP `31.22.4.176`
- DNS queries to domain `toptoptop1.online` (identified as malicious on VirusTotal)

**Relevant Zeek tools for this incident:**

| Tool | Key Data Extracted |
|---|---|
| HTTP Dashboard | URIs of downloaded executables (`CSPCA.crl`, `ncsi.txt` + malware PE) |
| DNS Dashboard | Resolution of `toptoptop1.online` + C2 queries |
| SSL Dashboard | Dridex certificates blacklisted by ABUSE.CH |
| PE Dashboard | Portable executables identified in the network flow |
| Kerberos Dashboard | Hostname and domain of the infected host |

**Key exam points:**
- `CSPCA.crl` is a Certificate Revocation List file — its presence is not abnormal in itself but may mask C2 communications
- `ncsi.txt` is related to the Windows Network Connectivity Status Indicator — may be used for environment profiling
- **Dridex** is a modular banking trojan that spreads via malicious Office documents (VBA macros) and uses SSL communications with self-signed certificates
- **Remcos** (Remote Control and Surveillance) is a commercial RAT repurposed for malicious use, employing obfuscation and encryption techniques to evade detection

---

### Case Study 4: SQL Injection + DNS Exfiltration

**Scenario:** PII (Personally Identifiable Information) including credit card information has been exfiltrated.

**SQL Injection — Attack pattern:**

```
username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

- `'` closes the string in the original SQL query
- `+union+select+` merges the result with a new query
- `from+credit_cards` explicitly targets the credit cards table
- `--+` comments out the end of the original query (password filter bypass)

**DNS Exfiltration — Mechanism:**
- Confidential data is hexadecimal-encoded
- Each hexadecimal block is inserted as a subdomain of a legitimate DNS query directed to an attacker-controlled domain (`ns.example.com`)
- The attacker's authoritative DNS server records all queries and reconstructs the data
- This technique bypasses most DLPs (Data Loss Prevention) because DNS is rarely deeply inspected

**Related regulatory requirements — PCI DSS:**
- **PCI DSS** (Payment Card Industry Data Security Standard) requires the retention of audit trail records of user activities related to protected data for a **minimum of 12 months**
- Compromise of credit card numbers (PAN — Primary Account Number) triggers notification and forensic investigation obligations

---

### Exam Questions — Precise Answers

| Question | Correct Answer |
|---|---|
| What SIEM function normalizes data in real time from multiple sources? | **Normalization** |
| What is the value of file hashes for network security investigations? | **They can serve as malware signatures** |
| What technology is an open-source SIEM system? | **ELK (Elasticsearch, Logstash, Kibana)** |
| What is the default log display time in Kibana? | **24 hours** |
| In what language is Elasticsearch written? | **Java** |
| How many months does PCI DSS require for audit trail retention? | **12 months** |
| What HIDS tool is integrated into Security Onion? | **OSSEC** |
| Which ELK component is responsible for data access, visualization, and investigation? | **Kibana** |
| What is the default alert retention period in Sguil via `securityonion.conf`? | **30 days** |
| What tool enables starting an investigation workflow in Security Onion? | **Sguil** |
| Which ELK component stores, indexes, and analyzes data? | **Elasticsearch** |
| What tool consolidates security events from multiple sources and interacts with Wireshark? | **Sguil** |

---
