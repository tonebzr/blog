---
title: Welcome to TBZR blog
template: splash
hero:
  tagline: Tech news and technical tutorials. Self-hosted AI, offensive/defensive security, radio exploration with GNU Radio & HackRF.
  image:
    file: ../../../assets/images/home/tbzr_stoat.webp
  actions:
    - text: Example Guide
      link: /guides/example/
      icon: right-arrow
    - text: Read the Starlight docs
      link: https://starlight.astro.build
      icon: external
      variant: minimal
---

import { Card, CardGrid } from '@astrojs/starlight/components';


<CardGrid>
  <Card title="Self-Hosted AI" icon="setting">
    Take back control of your models. From sourcing checkpoints on **Hugging Face** to building **Podman** containers optimized for **ROCm**, I guide you through **PyTorch** setup and **ComfyUI** workflow optimization. A sovereign approach to AI, free from cloud dependency. **Master your AI stack →**
  </Card>

  <Card title="Radio Exploration" icon="rss">
    Dive into the electromagnetic spectrum with **SDR**. Learn to master **GNU Radio** and leverage the power of the **HackRF One** to intercept, analyze, and understand the waves around us. From modulation basics to radio astronomy and RF security projects. **Explore the frequencies →**
  </Card>

  <Card title="Cybersecurity" icon="magnifier">
    Think of security as a process, not a tool. I walk you through everything from network monitoring (**NetFlow, IPS**) to malware analysis and incident response. Master the **Cyber Killing Chain** and Cisco frameworks to better defend your infrastructure and protect sensitive data. **Become a SOC analyst →**
  </Card>
</CardGrid>