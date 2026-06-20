# 🚨 Security Incident Quick Reference

**Keep this document accessible at all times**  
**Last Updated:** 2025-11-09

---

## 🔥 Emergency Actions (First 5 Minutes)

### Step 1: ASSESS
- Is this a real security incident? (Not a false positive)
- What is the severity? (SEV-1 to SEV-4)
- What systems are affected?

### Step 2: NOTIFY
**SEV-1 (Critical):** Call Incident Commander IMMEDIATELY  
**SEV-2 (High):** Notify Technical Lead within 15 minutes  
**SEV-3/4:** Create ticket and follow normal escalation

### Step 3: DOCUMENT
- Create incident ticket: #______
- Start timeline document
- Take screenshots
- DO NOT modify logs or evidence

---

## 📞 Emergency Contacts

| Role | Contact | When to Call |
|------|---------|--------------|
| **Incident Commander** | [PRIMARY] | SEV-1, SEV-2 incidents |
| **Technical Lead** | [TECH_LEAD] | Technical questions, SEV-2+ |
| **On-Call Engineer** | [ONCALL] | After hours detection |
| **Lovable Support** | https://lovable.dev/support | Platform issues |

---

## 🎯 Severity Classification

### SEV-1: CRITICAL 🔴
**Response Time:** < 15 minutes  
- Active data breach with data exfiltration
- Ransomware attack
- Complete service outage
- Unauthorized admin database access

### SEV-2: HIGH 🟠
**Response Time:** < 1 hour  
- Unauthorized user account access
- Active exploitation of vulnerabilities
- DDoS causing degradation
- Exposed credentials or API keys

### SEV-3: MEDIUM 🟡
**Response Time:** < 4 hours  
- Brute force attacks
- Phishing attempts
- Non-exploited vulnerabilities
- Rate limiting bypass attempts

### SEV-4: LOW 🟢
**Response Time:** < 24 hours  
- Security config drift
- False positives
- Minor policy violations

---

## 🛡️ Containment Actions by Incident Type

### 🔓 Unauthorized Access
```
✅ Check auth logs for suspicious sessions
✅ Revoke active sessions: Cloud → Auth → Sessions
✅ Reset passwords for affected accounts
✅ Block attacker IPs in rate limiting
✅ Enable MFA if not already active
```

### 💉 Injection Attack (SQL/XSS)
```
✅ Identify injection point in edge function logs
✅ Deploy input validation hotfix
✅ Update RLS policies if database affected
✅ Clear malicious data from database
✅ Purge CDN cache
```

### 🌊 DDoS / Rate Limiting Abuse
```
✅ Identify attack pattern (IPs, user agents, endpoints)
✅ Update rate limiting in affected edge functions
✅ Add IP blocks if concentrated attack
✅ Scale Cloud instance if needed (Settings → Cloud → Advanced)
```

### 🔑 Credential Compromise
```
✅ Identify which credentials (API keys, integration tokens)
✅ Rotate in Lovable Secrets (Settings → Cloud → Secrets)
✅ Update integration configs (JIRA, GitHub, Microsoft)
✅ Audit API usage logs for unauthorized actions
✅ Check edge function logs for suspicious calls
```

---

## 📊 Where to Find Logs

### Lovable Cloud Console
1. **Edge Function Logs:** Cloud → Edge Functions → [Function Name] → Logs
2. **Auth Logs:** Cloud → Auth → Activity
3. **Database Logs:** Cloud → Database → Activity
4. **API Logs:** Cloud → Logs

### Quick Log Queries
```sql
-- Recent failed auth attempts
SELECT * FROM auth_logs 
WHERE metadata->>'status' != '200' 
ORDER BY timestamp DESC LIMIT 100;

-- Suspicious user activity
SELECT * FROM user_activity_logs 
WHERE user_id = '[USER_ID]'
ORDER BY created_at DESC LIMIT 100;

-- Recent edge function errors
SELECT * FROM edge_function_logs
WHERE level = 'error'
ORDER BY timestamp DESC LIMIT 100;
```

---

## 🔒 Emergency Containment Commands

### Disable Edge Function (EMERGENCY)
```
1. Go to Cloud → Edge Functions
2. Select the affected function
3. Click "Disable" or update to return 503
```

### Force User Password Reset
```sql
-- In Cloud → Database → SQL Editor
-- CAUTION: This logs out the user immediately

UPDATE auth.users 
SET encrypted_password = NULL,
    updated_at = NOW()
WHERE id = '[USER_ID]';
```

### Revoke All User Sessions
```sql
-- In Cloud → Database → SQL Editor
-- CAUTION: This logs out all users

DELETE FROM auth.sessions 
WHERE user_id = '[USER_ID]';
```

### Block IP Address
```typescript
// Update in chat-demo/index.ts or other edge function
const BLOCKED_IPS = [
  '123.456.789.0',
  '198.51.100.0',
];

if (BLOCKED_IPS.includes(clientIp)) {
  return new Response(
    JSON.stringify({ error: 'Access denied' }),
    { status: 403, headers: corsHeaders }
  );
}
```

---

## 📝 Evidence Collection Checklist

**Do NOT modify original evidence**

```
[ ] Screenshots of suspicious activity
[ ] Export edge function logs (24h window)
[ ] Export auth logs (affected timeframe)
[ ] Export database query logs
[ ] Document timeline of events
[ ] List affected user accounts
[ ] List affected projects/workspaces
[ ] Identify compromised credentials
[ ] Note attacker IP addresses
[ ] Save network request logs
```

---

## 📢 User Notification Requirements

### When to Notify Users
✅ Confirmed data breach exposing personal info  
✅ Unauthorized account access  
✅ Service outage > 4 hours  
✅ Security vulnerability affecting user data  

### Timeline
- **72 hours** after breach confirmation (GDPR)
- **Immediately** for active threats
- **After containment** for resolved incidents

### What to Include
1. What happened (non-technical language)
2. What data was affected
3. What we're doing about it
4. What users should do (password reset, enable MFA)
5. Contact information for questions

---

## ✅ Recovery Validation Checklist

Before declaring "All Clear":

```
[ ] Threat confirmed eradicated (no persistence)
[ ] Security patches deployed
[ ] All affected systems operational
[ ] Monitoring shows no anomalies (24h)
[ ] Performance metrics normal
[ ] User reports declining
[ ] Incident Commander approves
[ ] Post-incident review scheduled
```

---

## 🔍 Common Attack Indicators

### Suspicious Authentication
- 10+ failed logins from same IP in 5 minutes
- Login from unusual country/timezone
- Multiple accounts accessed from single IP
- Login during non-business hours (unusual for user)

### Database Anomalies  
- `SELECT * FROM` queries (data exfiltration)
- Unusual table access patterns
- Mass UPDATE or DELETE operations
- RLS policy changes
- High-volume data exports

### Application Issues
- Spike in edge function errors
- Rate limit violations increasing
- Unusual API call patterns
- Unexpected file uploads to storage
- Integration config changes

---

## 🔄 Post-Incident Actions

### Immediate (Day 1)
- [ ] Update incident ticket with final status
- [ ] Send "all clear" notification to team
- [ ] Brief executive team
- [ ] Send user notification (if required)

### Short-term (Week 1)
- [ ] Schedule Post-Incident Review (PIR)
- [ ] Conduct PIR meeting
- [ ] Create action items from PIR
- [ ] Update this response plan
- [ ] Share lessons learned with team

### Long-term (Month 1)
- [ ] Complete all P0/P1 action items
- [ ] Update security monitoring
- [ ] Conduct tabletop exercise
- [ ] Review and update RLS policies
- [ ] Train team on new procedures

---

## 📚 Additional Resources

- **Full Incident Response Plan:** [SECURITY_INCIDENT_RESPONSE_PLAN.md](./SECURITY_INCIDENT_RESPONSE_PLAN.md)
- **Lovable Security Docs:** https://docs.lovable.dev/features/security
- **Supabase Security Guide:** https://supabase.com/docs/guides/database/database-linter
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

---

## 🎭 Incident Communication Templates

### Slack Alert
```
🚨 SECURITY INCIDENT [SEV-X] 🚨
ID: #______  |  Status: INVESTIGATING
Brief: [One sentence]
IC: @[NAME]  |  War Room: [LINK]
Next update: [TIME]
```

### Email to Users (Draft)
```
Subject: Important Security Notice - Action Required

Dear SAAI User,

We are writing to inform you of a security incident 
that may have affected your account.

What happened: [Brief description]
What data: [Specific data types]
What we did: [Our actions]
What you should do: 
1. Reset your password
2. Enable two-factor authentication
3. Review account activity

Questions? security@saai.com
Reference: [INCIDENT_ID]

SAAI Security Team
```

---

**🆘 IN DOUBT? ESCALATE!**

*It's better to escalate a minor incident than to miss a major breach.*

---

**Keep this document secure and accessible to authorized personnel only.**
