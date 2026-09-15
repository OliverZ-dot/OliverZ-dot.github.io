/*
  ============================================================
  RESEARCH MAP — DEFAULT / FALLBACK DATA
  ============================================================
  This is the map that ships with the page. Visitors (and you)
  can now also add/edit/delete nodes directly from the UI — click
  the pencil icon in the Research Map toolbar to turn on Edit
  Mode. Those in-browser edits are saved to localStorage on your
  own device.

  To make edits permanent for every visitor, use the "Export"
  button after editing in the browser: it gives you an updated
  version of this exact array — copy it in here and commit the
  file. You can still hand-edit this array too; the schema is:

    id       (required, string, unique)
    parent   (required, id of the parent node; null for the one
              root node)
    type     (required) 'root' | 'field' (a top-level domain) |
              'topic' (a sub-area within a domain) | 'idea' |
              'paper' | 'repo' | 'milestone'
    title    (required, string)
    subtitle (optional, string — don't combine with `venue`)
    venue    (optional, string — publication venue)
    date     (optional, string, shown in the detail popover)
    desc     (optional, string, shown in the detail popover)
    status   (optional) 'current' shows an animated badge
    links    (optional) [{ label, url }], shown as buttons in the
              popover (icons are inferred from the label)
  ============================================================
*/

window.RESEARCH_MAP_DATA = [

  // ---------------------------------------------------------------
  // ROOT
  // ---------------------------------------------------------------
  {
    id: 'root',
    parent: null,
    type: 'root',
    title: 'Tinghe Zhang',
    subtitle: 'Research Lineage',
    desc: '\u201cWhat I cannot create, I do not understand.\u201d \u2014 Feynman. Three focused tracks: LLM, World Model, and AI4S.'
  },

  // =================================================================
  // DOMAIN 1 — LLM
  // =================================================================
  {
    id: 'domain-llm',
    parent: 'root',
    type: 'field',
    title: 'LLM',
    subtitle: 'Reasoning \u00b7 Agents \u00b7 Safety',
    status: 'current',
    desc: 'Efficient reasoning, agentic systems, and safety for large language models.'
  },
  {
    id: 'idea-symbiotic',
    parent: 'domain-llm',
    type: 'idea',
    title: 'Symbiotic AI',
    subtitle: 'Proposed concept',
    status: 'current',
    date: 'Ongoing',
    desc: 'A paradigm I am formalizing that treats humans and AI as co-evolving, mutually-shaping systems rather than tool and user. Full write-up in progress.'
  },
  {
    id: 'topic-reasoning',
    parent: 'domain-llm',
    type: 'topic',
    title: 'Reasoning & Interpretability',
    subtitle: 'SFT \u00b7 RL \u00b7 Test-Time Scaling',
    status: 'current',
    desc: 'A framework spanning SFT, RL and test-time scaling to improve the reasoning ability of LLMs; also studies how/why they reason via interpretability. @ THU College of AI.'
  },
  {
    id: 'paper-e2c',
    parent: 'topic-reasoning',
    type: 'paper',
    title: 'Explore-Execute Chain (E2C)',
    venue: 'Under review \u00b7 EMNLP 2026',
    date: '2026',
    desc: 'An efficient structured reasoning paradigm that separates exploration from execution to cut redundant reasoning steps.',
    links: [
      { label: 'Code', url: 'https://github.com/OliverZ-dot/Explore-Execute-Chain' }
    ]
  },
  {
    id: 'paper-ffn',
    parent: 'topic-reasoning',
    type: 'paper',
    title: 'What Transformer FFNs Never See',
    venue: 'Under review \u00b7 NeurIPS 2026',
    date: '2026',
    desc: 'Studies a blind spot of Transformer FFN layers and proposes a lightweight fix \u2014 theory, diagnosis and remediation.',
    links: [
      { label: 'Code', url: 'https://github.com/NoWall-572/TopoSHIELD' }
    ]
  },
  {
    id: 'topic-agents',
    parent: 'domain-llm',
    type: 'topic',
    title: 'Agentic Systems',
    subtitle: 'Memory \u00b7 Retrieval',
    desc: 'Building blocks for agentic LLM systems: long-horizon memory and retrieval-augmented generation.'
  },
  {
    id: 'repo-novelclaw',
    parent: 'topic-agents',
    type: 'repo',
    title: 'NovelClaw',
    subtitle: 'Co-developer \u00b7 \u2605323',
    date: 'Ongoing',
    desc: 'Dynamic-memory-first collaborative AI system for long-form story generation.',
    links: [
      { label: 'Repo', url: 'https://github.com/iLearn-Lab/NovelClaw' }
    ]
  },
  {
    id: 'repo-rag',
    parent: 'topic-agents',
    type: 'repo',
    title: 'RAG-Anything',
    subtitle: 'Contributor \u00b7 \u260523.3k',
    date: 'Ongoing',
    desc: 'All-in-one multimodal Retrieval-Augmented Generation framework.',
    links: [
      { label: 'Repo', url: 'https://github.com/HKUDS/RAG-Anything' }
    ]
  },
  {
    id: 'topic-safety',
    parent: 'domain-llm',
    type: 'topic',
    title: 'Multi-Agent Safety',
    subtitle: 'Adversarial robustness',
    desc: 'Safety and robustness of multi-agent LLM systems against adversarial manipulation.'
  },
  {
    id: 'paper-toposhield',
    parent: 'topic-safety',
    type: 'paper',
    title: 'TOPOSHIELD',
    venue: 'ACL Findings 2026',
    date: '2026',
    desc: 'Reshapes the flow of malicious influence via spatio-temporal, risk-aware topological evolution in multi-agent LLM systems (collaboration with SEU).',
    links: [
      { label: 'Code', url: 'https://github.com/NoWall-572/TopoSHIELD' }
    ]
  },
  {
    id: 'topic-nlu',
    parent: 'domain-llm',
    type: 'topic',
    title: 'Multilingual NLU',
    subtitle: 'Cross-lingual transfer',
    desc: 'Cross-lingual spoken language understanding and multi-view contrastive learning for zero-shot transfer.'
  },
  {
    id: 'paper-slu',
    parent: 'topic-nlu',
    type: 'paper',
    title: 'Zero-shot Cross-lingual SLU',
    venue: 'ICASSP 2025',
    date: 'Jan 2025',
    desc: 'Zero-shot cross-lingual spoken language understanding via syntax-aware multi-view contrastive learning (collaboration with PKU).',
    links: [
      { label: 'Paper', url: 'https://ieeexplore.ieee.org/abstract/document/10889521' },
      { label: 'Code', url: 'https://github.com/NoWall-572/TopoSHIELD' }
    ]
  },

  // =================================================================
  // DOMAIN 2 — World Model
  // =================================================================
  {
    id: 'domain-worldmodel',
    parent: 'root',
    type: 'field',
    title: 'World Model',
    subtitle: 'Perception \u00b7 Prediction \u00b7 Action',
    status: 'current',
    desc: 'Learning predictive representations of the world for perception, forecasting and embodied action.'
  },
  {
    id: 'topic-repr',
    parent: 'domain-worldmodel',
    type: 'topic',
    title: 'Predictive Representation Learning',
    subtitle: 'JEPA-inspired',
    desc: 'Belief that JEPA-style predictive latent representations are a more promising path than pure statistical shortcuts such as next-token prediction alone.'
  },
  {
    id: 'paper-nodejepa',
    parent: 'topic-repr',
    type: 'paper',
    title: 'NodeJEPA: Structure-Conditioned Latent Prediction',
    venue: 'Preprint',
    date: 'Aug 2026',
    desc: 'Structure-conditioned latent prediction for node-level graph self-supervised learning, applying JEPA-style objectives to graphs.',
    links: [
      { label: 'arXiv', url: 'https://arxiv.org/abs/2608.04381' },
      { label: 'PDF', url: 'https://arxiv.org/pdf/2608.04381' },
      { label: 'Code', url: 'https://github.com/OliverZ-dot/Node-Jepa' }
    ]
  },
  {
    id: 'topic-traj',
    parent: 'domain-worldmodel',
    type: 'topic',
    title: 'Motion & Trajectory Forecasting',
    subtitle: 'Social forecasting',
    desc: 'Forecasting pedestrian/agent trajectories via explicit planning-and-reaction decomposition and dynamic activation mechanisms.'
  },
  {
    id: 'paper-unified',
    parent: 'topic-traj',
    type: 'paper',
    title: 'A Unified Framework for Trajectory Prediction',
    venue: 'ACM MM 2026',
    date: '2026',
    desc: 'A unified trajectory-prediction framework with explicit decomposition of planning and reaction components.',
    links: [
      { label: 'Code', url: 'https://github.com/NoWall-572/TopoSHIELD' }
    ]
  },
  {
    id: 'paper-gear',
    parent: 'topic-traj',
    type: 'paper',
    title: 'GEAR: Dynamic Encoding to Dynamic Activation',
    venue: 'ICDM 2026',
    date: '2026',
    desc: 'Moves from dynamic encoding to dynamic activation for social trajectory prediction.'
  },
  {
    id: 'topic-embodied',
    parent: 'domain-worldmodel',
    type: 'topic',
    title: 'Embodied Driving',
    subtitle: '3D point-cloud perception',
    status: 'current',
    desc: 'Exploring autonomous driving with 3D point-cloud inputs. @ THU College of AI.'
  },
  {
    id: 'milestone-embodied',
    parent: 'topic-embodied',
    type: 'milestone',
    title: '3D Point-Cloud Driving Research',
    subtitle: 'Ongoing @ THU CAI',
    date: 'Dec 2025 \u2013 Present',
    desc: 'Exploring autonomous driving with 3D point-cloud inputs as part of the World Model track at THU College of AI.'
  },

  // =================================================================
  // DOMAIN 3 — AI4S (AI for Science)
  // =================================================================
  {
    id: 'domain-ai4s',
    parent: 'root',
    type: 'field',
    title: 'AI4S',
    subtitle: 'AI for Science',
    desc: 'Applying AI methods to accelerate scientific discovery and the computation that underlies it.'
  },
  {
    id: 'topic-medical',
    parent: 'domain-ai4s',
    type: 'topic',
    title: 'Medical Imaging',
    subtitle: 'MIT collaboration',
    desc: 'Cross-modal medical image synthesis \u2014 reconstructing PET signals from MRI while preserving pathological features.'
  },
  {
    id: 'paper-pwt',
    parent: 'topic-medical',
    type: 'paper',
    title: 'PWT: PET Synthesis from MRI',
    venue: 'IEEE UV 2024',
    date: 'Sep 2024',
    desc: 'Advances Alzheimer\u2019s PET synthesis from MRI with enhanced pathological feature preservation (MIT).'
  },
  {
    id: 'topic-compute',
    parent: 'domain-ai4s',
    type: 'topic',
    title: 'Scientific Computing Infrastructure',
    subtitle: 'Secure & distributed',
    desc: 'Secure, efficient distributed computation supporting large-scale scientific and ML workloads.'
  },
  {
    id: 'paper-ngdn',
    parent: 'topic-compute',
    type: 'paper',
    title: 'Secure Distributed Matrix Multiplication',
    venue: 'IEEE NGDN 2025',
    date: 'May 2025',
    desc: 'Secure and efficient distributed matrix multiplication for privacy-preserving distributed computation.'
  }

];
