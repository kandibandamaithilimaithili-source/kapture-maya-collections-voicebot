const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.post("/webhook", (req, res) => {
  const message = req.body?.message;
  if (message?.type !== "tool-calls") return res.status(200).json({ status: "acknowledged" });
  const toolCall = message.toolCalls?.[0];
  if (!toolCall) return res.status(400).json({ error: "No tool call found" });
  const name = toolCall.function?.name;
  const args = toolCall.function?.arguments || {};
  const callId = toolCall.id;
  let result;

  switch (name) {
    case "verify_customer": {
      const valid = args.account_id === "ACC-88392" && ["1234", "1995"].includes(String(args.verification_code).trim());
      result = valid ? { verified: true, customer_name: "Rahul Sharma" } : { verified: false, message: "Verification failed." };
      break;
    }
    case "get_account_details":
      result = { account_id: args.account_id, customer_name: "Rahul Sharma", loan_type: "Personal Loan", overdue_amount: 8499, days_past_due: 12 };
      break;
    case "log_promise_to_pay":
      result = { success: true, ptp_id: `PTP-${Math.floor(1000 + Math.random()*9000)}`, confirmed_date: args.ptp_date, amount: args.amount };
      break;
    case "send_payment_link":
      result = { success: true, link_sent: true, channel: args.channel };
      break;
    case "escalate_to_agent":
      result = { success: true, escalation_id: `ESC-${Date.now()}`, reason: args.reason };
      break;
    case "mark_disposition":
      result = { success: true, disposition_logged: args.status, timestamp: new Date().toISOString() };
      break;
    default:
      result = { success: false, message: "Unknown tool" };
  }
  res.status(200).json({ results: [{ toolCallId: callId, result: JSON.stringify(result) }] });
});

app.listen(PORT, () => console.log(`Mock webhook server listening on ${PORT}`));
