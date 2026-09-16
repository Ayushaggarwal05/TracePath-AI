# AI Provider Configuration & Multi-Agent Architecture

TracePath AI uses **THREE INDEPENDENT AI AGENTS**. Each agent is decoupled, allowing you to configure different LLM providers, model families, and temperature thresholds for each step of the pipeline.

---

## Agent Pipeline Overview

```
                      GitHub Push Event
                             │
                             ▼
                 [Bounded Context Builder]
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 1: ANALYSIS AGENT │
                │  - Semantic Code Diff   │
                │  - Architecture Impact  │
                │  - Behavioral Changes   │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 2: DECISION AGENT │
                │  - Differential Matrix  │
                │  - No-op Diff Filter    │
                │  - Target Doc Decision  │
                └────────────┬────────────┘
                             │
                      [If Affected]
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 3: DOC GENERATOR  │
                │  - Minimal Delta Edits  │
                │  - Syntax & Heading Val │
                │  - Unified Diff Output  │
                └────────────┬────────────┘
                             │
                             ▼
              [Deterministic Backend Commit/PR]
```

---

## Recommended Model Configurations

### 1. Cost-Optimized / High-Speed Configuration
```env
# Agent 1: Fast reasoning on code diffs
AGENT_1_MODEL=gpt-4o-mini
AGENT_1_API_KEY=sk-...
AGENT_1_TEMPERATURE=0.1

# Agent 2: Precision decision making
AGENT_2_MODEL=gpt-4o-mini
AGENT_2_API_KEY=sk-...
AGENT_2_TEMPERATURE=0.0

# Agent 3: High-fidelity markdown writing
AGENT_3_MODEL=gpt-4o
AGENT_3_API_KEY=sk-...
AGENT_3_TEMPERATURE=0.2
```

### 2. Premium Quality / Complex Monorepos
```env
# Agent 1: Deep comprehension
AGENT_1_MODEL=gpt-4o
AGENT_1_API_KEY=sk-...

# Agent 2: Architectural differential evaluation
AGENT_2_MODEL=claude-3-5-sonnet
AGENT_2_API_KEY=sk-ant-...

# Agent 3: Flawless documentation generation
AGENT_3_MODEL=claude-3-5-sonnet
AGENT_3_API_KEY=sk-ant-...
```

---

## Supported Providers & OpenAI-Compatible Endpoints

TracePath AI supports any OpenAI-compatible API provider:
- **OpenAI**: `https://api.openai.com/v1`
- **Anthropic Claude**: Via OpenAI-compatible proxy or adapter
- **Google Gemini**: Via Google OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`)
- **Groq / Together / DeepSeek / Local Ollama**: Set `AGENT_X_BASE_URL=http://localhost:11434/v1`

---

## Prompt Injection Defense & Safety Rules

All 3 agents operate under strict security constraints:
1. **Untrusted Input Boundaries**: All repository content, diffs, and commit messages are encapsulated inside `<UNTRUSTED_REPOSITORY_INPUT>` tags.
2. **Instruction Neutralization**: Agents are instructed never to follow instructions embedded within the repository files.
3. **No-op Diff Detection**: If changes are cosmetic or already in sync, Agent 2 issues `NO_UPDATE_REQUIRED` and skips doc generation.
