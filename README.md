# Kapture Finance – Maya Voice AI Collections Agent

## Files
- docs/HLD_Document.md
- docs/architecture.mmd
- vapi/system_prompt.txt
- vapi/tool_definitions.json
- mock-server/server.js
- mock-server/package.json
- tests/test_cases.json

## Mock Server
Requires Node.js 18+.
1. `cd mock-server`
2. `npm install`
3. `npm start`
4. Check `GET /health`.
5. Expose `/webhook` using an HTTPS tunnel if required by Vapi.

## Suggested Vapi Setup
Transcriber: Deepgram Nova-2
LLM: GPT-4o or GPT-4o-mini
Temperature: 0.1
Voice: ElevenLabs or Cartesia professional voice
Tool webhook: public HTTPS URL + `/webhook`

## Demo
Happy path: Greeting → Auth → Debt Disclosure → PTP → Payment Link → Disposition → Close.
Edge path: Greeting → Auth → Already Paid / Dispute / DNC → Correct Tool → Disposition → Close.

## Debugging
- Early disclosure: enforce AUTH_PENDING and require verify_customer=true.
- Wrong parameters: use strict JSON schemas.
- Relative dates: normalize to ISO-8601 before PTP tool call.
- Tool failures: return deterministic JSON and log errors.
- Language switch: language must not change state.

## Limitation
A real Vapi account, public webhook URL, phone call and demo recording must be created by the submitter. This repository does not fabricate those external artifacts.
