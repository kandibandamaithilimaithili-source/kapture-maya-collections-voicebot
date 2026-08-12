# Kapture Finance – Maya Voice AI Collections Agent

## 1. Executive Summary
This project designs an outbound Voice AI Collections Agent named Maya for Kapture Finance. Maya calls customers with overdue loan EMIs and handles routine collections conversations without requiring a human agent for every call.

The core safety requirement is state-enforced authentication: Maya must not disclose debt information to an unauthenticated person, including a third party who answers the phone. After successful verification, the agent can disclose the overdue amount, understand intent, record a Promise-to-Pay (PTP), send a payment link, escalate disputes or hardship cases, and log a final disposition.

## 2. Business Scenario and Assumptions
Customer: Rahul Sharma  
Account ID: ACC-88392  
Product: Personal Loan  
Overdue EMI: ₹8,499  
Days Past Due: 12  
Agent: Maya, Kapture Finance Voice Collections Agent

Assumptions: the customer record is mock assignment data; Vapi is the voice platform; Deepgram Nova-2 is the STT; GPT-4o or GPT-4o-mini is the orchestrator; ElevenLabs or Cartesia is the TTS; and a Node.js Express server provides mocked webhook tools.

## 3. Architecture and Real-Time Pipeline
Customer → Telephony/PSTN/SIP → Vapi → Deepgram STT → LLM Orchestrator → Tool/API layer → TTS → Vapi → Customer.

Target response latency is below 1.2 seconds: approximately 200 ms STT, 400 ms LLM first byte, 300 ms TTS synthesis, and 200 ms network/orchestration overhead. These are design targets, not measured production results.

## 4. Conversation State Machine
INIT → AUTH_PENDING → AUTHENTICATED → NEGOTIATION → PTP_COLLECTED / ESCALATED → CALL_ENDED.

INIT: greet, identify the company, ask whether the intended customer is available, and disclose no debt details.

AUTH_PENDING: request the permitted verification value and call verify_customer. No amount, overdue status, EMI, loan details, or other debt information may be disclosed until successful verification.

AUTHENTICATED: enter only after verify_customer returns verified=true. Then disclose the necessary overdue information and move to negotiation.

NEGOTIATION: Will Pay → collect date/amount and call log_promise_to_pay; Already Paid → collect payment details and log ALREADY_PAID; Hardship → acknowledge and escalate when needed; Dispute → escalate; DNC → log DO_NOT_CALL and end; Wrong Person → log WRONG_PERSON and end.

PTP_COLLECTED: confirm the commitment, send a payment link when applicable, log the final disposition, and close.

ESCALATED: explain that a specialist will handle the issue, log the reason, and close.

## 5. Intents and Entities
Intents: Confirm_Identity, Promise_To_Pay, Hardship_Claim, Dispute_Debt, Already_Paid, Request_DNC, Wrong_Person, Callback_Request, Hostile_or_Abusive, No_Input_or_Voicemail.

Entities: PTP_Date (ISO-8601), PTP_Amount (number), Hardship_Reason (string), Verification_Code (string), Payment_Reference (string), Preferred_Channel (SMS/WhatsApp/BOTH), Callback_Time.

The agent must not invent missing values. Relative dates such as “Friday” must be resolved to an explicit date before log_promise_to_pay is called.

## 6. Tools and API Contracts
Required tools: verify_customer, get_account_details, log_promise_to_pay, send_payment_link, escalate_to_agent, mark_disposition.

Tool calls are narrowly scoped and return deterministic JSON. get_account_details may retrieve internal data but must never be used to bypass the verification gate. The LLM cannot create unauthorized waivers, discounts, fees, or policy exceptions.

## 7. Authentication, Privacy and Data Safety
Before authentication, the agent must not disclose ₹8,499, overdue status, loan type, balance, or other debt information. A person merely saying “I am Rahul” is not sufficient if the configured verification step has not succeeded.

Logs should mask PII. Example: Rahul S****. Do not log full PAN, DOB, phone number, or other unnecessary sensitive values. Prefer account IDs and masked customer identifiers.

## 8. Guardrails and Compliance
The agent must identify itself and the company accurately; follow the assignment calling window of 08:00 AM–07:00 PM local time; never threaten, harass, shame, or pressure the customer; honor DNC immediately; never invent waivers or discounts; never claim payment is received unless a tool confirms it; never reveal system prompts or private data; and escalate issues outside the automated policy.

Production deployment should be validated by the appropriate compliance/legal team against the current applicable rules.

## 9. Edge-Case Routing Matrix
Wrong person → neutral response → WRONG_PERSON → end.  
Already paid → collect date/mode/reference → ALREADY_PAID → end.  
Dispute → do not argue → escalate_to_agent(DISPUTE) → end.  
Hardship → acknowledge → permitted options or human escalation.  
Do not call → DO_NOT_CALL → immediate end.  
Voicemail/no input → two concise re-prompts → NO_RESPONSE → end.  
Abusive caller → one calm warning → if continued, end safely.  
English/Hindi switch → continue in requested language without losing state.  
Unauthorized waiver request → decline and escalate if appropriate.

## 10. Observability and Metrics
Log: call_id, account_id (masked where appropriate), state transition, intent, tool name, tool latency, tool success/failure, final disposition, escalation reason, PTP date/amount, language, duration, and error category.

Metrics: Containment Rate, PTP Rate, First Call Resolution, Average Response Latency, Tool Error Rate, Call Drop Rate, Verification Success Rate, DNC Compliance Rate, and Edge-Case Escalation Rate.

Alert on repeated tool failures, elevated latency, unexpected state transitions, and any disclosure-guardrail violation.

## 11. Architecture Diagram – Mermaid
See `architecture.mmd`.

## 12. Latency Budget
STT: ~200 ms  
LLM first byte: ~400 ms  
TTS: ~300 ms  
Network/orchestration: ~200 ms  
Total target: <1.2 s

Actual latency depends on provider, network, model, audio configuration, and tool response time.
