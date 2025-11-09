# SAAI Security Incident Response Plan

**Document Version:** 1.0  
**Last Updated:** 2025-11-09  
**Owner:** Security Team  
**Classification:** Internal Use Only

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Incident Response Team](#incident-response-team)
3. [Incident Classification](#incident-classification)
4. [Response Procedures](#response-procedures)
5. [Notification Protocols](#notification-protocols)
6. [Recovery Procedures](#recovery-procedures)
7. [Post-Incident Activities](#post-incident-activities)
8. [Appendices](#appendices)

---

## Executive Summary

This Security Incident Response Plan (SIRP) establishes procedures for detecting, responding to, and recovering from security incidents affecting the SAAI (Smart Agile AI) platform. The plan ensures rapid response to minimize impact on users, data, and business operations.

### Objectives
- **Detect** security incidents quickly through monitoring and alerting
- **Contain** incidents to prevent further damage or data exposure
- **Eradicate** threats from the environment completely
- **Recover** systems and services to normal operations
- **Learn** from incidents to improve security posture

### Scope
This plan covers all security incidents affecting:
- SAAI web application (frontend)
- Lovable Cloud backend (Supabase)
- Edge functions and serverless logic
- User data and authentication systems
- Third-party integrations (JIRA, GitHub, Microsoft)
- Project and workspace data

---

## Incident Response Team

### Core Team Structure

#### Incident Commander (IC)
**Role:** Overall incident coordination and decision-making  
**Contact:** [PRIMARY_CONTACT]  
**Responsibilities:**
- Declare and classify incidents
- Coordinate all response activities
- Authorize system changes and communications
- Decide on escalation to authorities if required

#### Technical Lead
**Role:** Technical investigation and remediation  
**Contact:** [TECHNICAL_LEAD]  
**Responsibilities:**
- Lead technical analysis and forensics
- Implement containment and eradication measures
- Coordinate with Lovable Cloud support if needed
- Document technical findings

#### Communications Lead
**Role:** Internal and external communications  
**Contact:** [COMMS_LEAD]  
**Responsibilities:**
- Draft user notifications
- Coordinate with legal and compliance
- Manage media inquiries if applicable
- Document all communications

#### Security Analyst
**Role:** Threat analysis and monitoring  
**Contact:** [SECURITY_ANALYST]  
**Responsibilities:**
- Monitor security logs and alerts
- Perform threat intelligence research
- Identify indicators of compromise (IOCs)
- Update security rules and policies

### Escalation Contacts

| Level | Contact | When to Escalate |
|-------|---------|------------------|
| **L1** | On-call engineer | Initial detection, minor incidents |
| **L2** | Technical Lead | Critical systems affected, data exposure risk |
| **L3** | Incident Commander | Major breach, regulatory notification required |
| **L4** | Executive Team | Public disclosure, legal action, severe impact |

### External Contacts

- **Lovable Support:** https://lovable.dev/support
- **Supabase Support:** support@supabase.com
- **Legal Counsel:** [LEGAL_CONTACT]
- **Cyber Insurance:** [INSURANCE_CONTACT]
- **Law Enforcement:** [LOCAL_CYBER_CRIME_UNIT]

---

## Incident Classification

### Severity Levels

#### SEV-1: Critical (P1)
**Response Time:** Immediate (< 15 minutes)  
**Examples:**
- Active data breach with confirmed data exfiltration
- Ransomware attack encrypting production data
- Complete service outage affecting all users
- Unauthorized admin access to production database
- Public disclosure of critical vulnerabilities

**Impact:**
- Large-scale data exposure (>1000 users)
- Complete loss of service availability
- Significant financial or reputational damage
- Regulatory compliance violations

#### SEV-2: High (P2)
**Response Time:** < 1 hour  
**Examples:**
- Suspected unauthorized access to user accounts
- SQL injection or XSS vulnerability actively exploited
- DDoS attack causing service degradation
- Exposure of API keys or credentials
- Malware detected in application infrastructure

**Impact:**
- Limited data exposure (<1000 users)
- Partial service degradation
- Potential compliance violations
- Moderate business impact

#### SEV-3: Medium (P3)
**Response Time:** < 4 hours  
**Examples:**
- Suspicious login attempts or brute force attacks
- Minor security policy violations
- Phishing attempts targeting employees
- Vulnerability discovered but not exploited
- Rate limiting bypass attempts

**Impact:**
- Minimal or no data exposure
- Limited service impact
- Low business impact

#### SEV-4: Low (P4)
**Response Time:** < 24 hours  
**Examples:**
- Security configuration drift
- False positive alerts
- Security awareness incidents
- Minor policy violations

**Impact:**
- No immediate risk
- Informational only

---

## Response Procedures

### Phase 1: Detection & Analysis

#### 1.1 Detection Methods

**Automated Monitoring:**
- Lovable Cloud security alerts
- Supabase database logs monitoring
- Edge function error rate spikes
- Failed authentication attempts (>10 in 5 minutes)
- Rate limit violations
- Unusual database query patterns

**Manual Detection:**
- User reports of suspicious activity
- Security audit findings
- Third-party security notifications
- Bug bounty reports

#### 1.2 Initial Assessment

**Upon Detection (< 15 minutes):**
1. **Verify the incident is genuine** (not a false positive)
2. **Document initial observations:**
   - Time of detection
   - Detection method
   - Affected systems/users
   - Initial symptoms
3. **Classify severity** using the matrix above
4. **Notify Incident Commander** if SEV-1 or SEV-2
5. **Create incident ticket** in tracking system

**Initial Assessment Checklist:**
```
[ ] Incident verified as genuine
[ ] Severity level assigned
[ ] Incident Commander notified (if SEV-1/SEV-2)
[ ] Incident ticket created: #______
[ ] Initial containment actions identified
[ ] Evidence preservation initiated
```

#### 1.3 Evidence Collection

**Immediate Actions:**
1. **Take screenshots** of suspicious activity
2. **Export relevant logs:**
   ```bash
   # Lovable Cloud logs
   - Edge function logs (past 24h)
   - Database query logs
   - Authentication logs
   - Network request logs
   ```
3. **Document timeline** of events
4. **Preserve system state** before making changes
5. **Identify affected resources:**
   - User accounts
   - Projects/workspaces
   - Database tables
   - API endpoints

**Evidence Storage:**
- Store all evidence in secure, immutable storage
- Maintain chain of custody documentation
- Restrict access to investigation team only
- Do NOT modify or delete original evidence

---

### Phase 2: Containment

#### 2.1 Short-term Containment (Immediate)

**Goal:** Stop the incident from spreading while preserving evidence

**Actions by Incident Type:**

##### Data Breach / Unauthorized Access
```
1. Identify compromised accounts:
   - Check auth logs for suspicious sessions
   - Review recent project access patterns
   
2. Revoke access immediately:
   - Terminate active sessions (Supabase)
   - Reset passwords for affected accounts
   - Revoke API tokens if compromised
   
3. Block attacker infrastructure:
   - Add IP addresses to blocklist
   - Update rate limiting rules
   - Enable stricter authentication requirements
   
4. Isolate affected systems:
   - Disable compromised edge functions
   - Restrict database access if needed
   - Enable audit mode on affected tables
```

##### Malicious Code / Injection Attack
```
1. Identify injection point:
   - Review edge function logs
   - Check database query logs for SQL injection
   - Inspect XSS attack vectors
   
2. Deploy hotfix immediately:
   - Add input validation
   - Escape user inputs
   - Update RLS policies if needed
   
3. Clear malicious data:
   - Remove injected scripts from database
   - Clear application caches
   - Purge CDN cache if affected
```

##### DDoS / Rate Limiting Abuse
```
1. Identify attack patterns:
   - Source IPs and user agents
   - Targeted endpoints
   - Request patterns
   
2. Update rate limiting:
   - Tighten demo chat rate limits
   - Add IP-based throttling
   - Enable CAPTCHA for affected endpoints
   
3. Scale infrastructure if needed:
   - Increase Lovable Cloud instance size
   - Enable additional protection layers
```

##### Credential Compromise
```
1. Identify compromised credentials:
   - Which API keys/tokens
   - Services affected (JIRA, GitHub, Microsoft)
   
2. Rotate all credentials:
   - Update integration tokens in Lovable Secrets
   - Regenerate API keys
   - Update .env variables
   
3. Audit credential usage:
   - Review API call logs
   - Check for unauthorized actions
   - Identify affected projects
```

#### 2.2 Long-term Containment

**Goal:** Prepare for complete eradication while maintaining business continuity

**Actions:**
1. **Implement workarounds** to restore service
2. **Deploy additional monitoring** for affected areas
3. **Prepare permanent fixes** without rushing
4. **Communicate with stakeholders** about status
5. **Plan for eradication phase**

---

### Phase 3: Eradication

#### 3.1 Root Cause Analysis

**Investigate:**
1. **How did the attacker gain access?**
   - Vulnerability exploited
   - Credential theft method
   - Social engineering approach
2. **What was the attack timeline?**
   - Initial compromise date/time
   - Lateral movement activities
   - Data exfiltration attempts
3. **What is the full scope of compromise?**
   - All affected systems
   - All exposed data
   - All planted backdoors

#### 3.2 Threat Removal

**Complete Remediation:**
1. **Deploy security patches:**
   ```bash
   # Update all dependencies
   - Review and update package.json
   - Update Lovable Cloud configuration
   - Apply security fixes to edge functions
   ```

2. **Remove all malicious artifacts:**
   - Delete backdoor accounts
   - Remove malicious code
   - Clean compromised data
   - Purge attack infrastructure references

3. **Strengthen security controls:**
   - Update RLS policies
   - Enhance input validation
   - Implement additional monitoring
   - Add new security rules

4. **Verify eradication:**
   - Scan for remaining vulnerabilities
   - Test all attack vectors
   - Verify no persistence mechanisms remain

---

### Phase 4: Recovery

#### 4.1 Service Restoration

**Phased Recovery Approach:**

##### Phase 4.1.1: Validation (Pre-restoration)
```
[ ] All threats confirmed eradicated
[ ] Security patches deployed and tested
[ ] Monitoring enhanced and operational
[ ] Incident Commander approves restoration
[ ] Communication plan ready
```

##### Phase 4.1.2: Staged Rollout
```
1. Restore non-critical services first:
   - Test with internal team (30 minutes)
   - Enable for 10% of users (1 hour)
   - Monitor for anomalies
   
2. Gradually increase user access:
   - 25% of users (2 hours)
   - 50% of users (4 hours)
   - 100% of users (8 hours)
   
3. Monitor continuously:
   - Watch for attack recurrence
   - Track error rates
   - Monitor user reports
```

##### Phase 4.1.3: Full Restoration
```
[ ] All services operational
[ ] All users have access
[ ] Performance metrics normal
[ ] No security anomalies detected
[ ] Monitoring confirms stability
```

#### 4.2 Data Recovery (If Applicable)

**If Data Was Lost or Encrypted:**

1. **Assess backup availability:**
   ```
   - Lovable Cloud automatic backups
   - Supabase point-in-time recovery
   - Manual backup archives
   ```

2. **Restore from clean backup:**
   ```bash
   # Restore database to point before incident
   # Verify backup integrity first
   # Test restore in isolated environment
   # Apply any missing legitimate changes
   ```

3. **Validate restored data:**
   - Verify data integrity
   - Confirm no malicious artifacts
   - Test application functionality
   - Validate with affected users

#### 4.3 User Account Recovery

**For Compromised User Accounts:**

1. **Force password resets** for affected users
2. **Revoke all active sessions**
3. **Enable MFA** for all affected accounts
4. **Review and restore** project permissions
5. **Audit account activity** for unauthorized changes

---

## Notification Protocols

### 5.1 Internal Notification

#### Immediate Notifications (SEV-1, SEV-2)

**Within 15 minutes of incident confirmation:**
- Incident Commander
- Technical Lead
- Executive Team (SEV-1 only)

**Notification Template:**
```
SECURITY INCIDENT ALERT [SEV-X]

Incident ID: #______
Time Detected: [TIMESTAMP]
Severity: [SEV-1/SEV-2]
Status: [INVESTIGATING/CONTAINED/RESOLVED]

Summary:
[Brief description of incident]

Impact:
[Affected systems and users]

Actions Taken:
[Brief list of containment actions]

Next Steps:
[Immediate response plan]

Incident Commander: [NAME]
War Room: [LOCATION/LINK]
```

#### Regular Status Updates

**Frequency by Severity:**
- SEV-1: Every 30 minutes
- SEV-2: Every 2 hours
- SEV-3: Daily
- SEV-4: Weekly

### 5.2 User Notification

#### When to Notify Users

**Mandatory Notification:**
- Confirmed data breach exposing personal information
- Unauthorized access to user accounts
- Service outage exceeding 4 hours
- Security vulnerability affecting user data

**Notification Timeline:**
- **Within 72 hours** of breach confirmation (GDPR requirement)
- **As soon as possible** for active threats
- **After containment** for resolved incidents

#### User Notification Template

**Email Subject:** Important Security Update - Action Required

```
Dear SAAI User,

We are writing to inform you about a security incident that may have 
affected your account.

WHAT HAPPENED:
[Clear, non-technical explanation of the incident]

WHAT INFORMATION WAS INVOLVED:
[Specific data types exposed, e.g., "email addresses and project names"]

WHAT WE'RE DOING:
- [Action 1: e.g., "We have secured the vulnerability"]
- [Action 2: e.g., "We have reset all user passwords"]
- [Action 3: e.g., "We have enhanced our security monitoring"]

WHAT YOU SHOULD DO:
1. [Action 1: e.g., "Reset your password immediately"]
2. [Action 2: e.g., "Enable two-factor authentication"]
3. [Action 3: e.g., "Review your project access logs"]

We take the security of your data extremely seriously. If you have any 
questions, please contact us at security@saai.com.

We sincerely apologize for this incident and any inconvenience caused.

Best regards,
The SAAI Security Team

Reference ID: [INCIDENT_ID]
Date: [DATE]
```

### 5.3 Regulatory Notification

#### Regulatory Requirements

**GDPR (If Applicable):**
- Notify supervisory authority **within 72 hours**
- Provide detailed incident report
- Document notification in incident log

**Other Jurisdictions:**
Check specific requirements for:
- California (CCPA): 72 hours
- EU member states: Various timelines
- Sector-specific regulations (HIPAA, PCI-DSS, etc.)

#### Regulatory Notification Template

```
PERSONAL DATA BREACH NOTIFICATION

To: [Data Protection Authority]
From: [SAAI / Organization Name]
Date: [Notification Date]
Reference: [Incident ID]

1. DESCRIPTION OF BREACH:
[Detailed description of what happened]

2. CATEGORIES AND APPROXIMATE NUMBER OF DATA SUBJECTS:
- Email addresses: [NUMBER]
- Names: [NUMBER]
- Project data: [NUMBER]
[etc.]

3. CONTACT POINT:
Name: [Data Protection Officer]
Email: [CONTACT]
Phone: [PHONE]

4. LIKELY CONSEQUENCES:
[Assessment of risks to individuals]

5. MEASURES TAKEN OR PROPOSED:
- Immediate containment actions
- Long-term security improvements
- User notification plan

6. CROSS-BORDER IMPLICATIONS:
[If applicable]

[Full signature and contact details]
```

---

## Recovery Procedures

### 6.1 System Recovery Checklist

#### Database Recovery
```
[ ] Verify database integrity
[ ] Check RLS policies are active
[ ] Validate user permissions
[ ] Test critical queries
[ ] Verify backup systems
[ ] Update database credentials
[ ] Run security linter
[ ] Document any schema changes
```

#### Application Recovery
```
[ ] Deploy security patches
[ ] Update all dependencies
[ ] Verify edge functions operational
[ ] Test authentication flow
[ ] Validate API integrations
[ ] Check frontend functionality
[ ] Clear application caches
[ ] Verify SSL/TLS certificates
```

#### Integration Recovery
```
[ ] Rotate integration tokens (JIRA, GitHub, Microsoft)
[ ] Test integration connectivity
[ ] Verify webhook configurations
[ ] Check API rate limits
[ ] Validate OAuth flows
[ ] Test data synchronization
[ ] Update integration documentation
```

### 6.2 Performance Validation

**Metrics to Monitor Post-Recovery:**
- Authentication success rate: >99%
- API response time: <500ms (p95)
- Database query performance: <100ms (p95)
- Edge function error rate: <0.1%
- User login success rate: >98%

**Validation Period:**
- **24 hours** of continuous monitoring
- **7 days** of enhanced monitoring
- **30 days** of incident-specific monitoring

### 6.3 User Support

**Post-Incident User Support:**
1. **Set up dedicated support channel**
   - Priority email: security-support@saai.com
   - Response time: <2 hours
2. **Create FAQ document** addressing common concerns
3. **Offer security audit** for affected accounts
4. **Provide guidance** on enhanced security measures

---

## Post-Incident Activities

### 7.1 Post-Incident Review (PIR)

**Schedule Within:** 5 business days of incident resolution

**Attendees:**
- Incident Commander
- Technical Lead
- All responders
- Executive stakeholders (SEV-1, SEV-2)

**PIR Agenda:**
1. **Incident Timeline Review** (15 min)
   - Walk through complete timeline
   - Identify key decision points
2. **What Went Well** (15 min)
   - Effective detection methods
   - Successful response actions
   - Strong team coordination
3. **What Went Wrong** (30 min)
   - Detection delays
   - Response gaps
   - Communication issues
4. **Root Cause Analysis** (30 min)
   - Technical root cause
   - Process failures
   - Contributing factors
5. **Action Items** (20 min)
   - Security improvements
   - Process updates
   - Training needs
6. **Documentation Review** (10 min)

### 7.2 Action Items and Remediation

**Document Format:**
| Action Item | Owner | Priority | Due Date | Status |
|-------------|-------|----------|----------|--------|
| Implement MFA for all users | Security Lead | P1 | [DATE] | In Progress |
| Update RLS policies | Tech Lead | P1 | [DATE] | Not Started |
| Enhance monitoring | Security Analyst | P2 | [DATE] | Not Started |

**Priority Levels:**
- **P0:** Critical, immediate action (< 1 week)
- **P1:** High priority (< 1 month)
- **P2:** Medium priority (< 3 months)
- **P3:** Low priority (< 6 months)

### 7.3 Lessons Learned Documentation

**Create Lessons Learned Document:**
```markdown
# Incident [ID] - Lessons Learned

## Executive Summary
[Brief overview for leadership]

## Incident Details
- Date/Time: [TIMESTAMP]
- Duration: [DURATION]
- Severity: [SEV-X]
- Impact: [DESCRIPTION]

## What Happened
[Detailed narrative]

## Root Cause
[Technical and procedural root causes]

## What Worked Well
- [Positive aspect 1]
- [Positive aspect 2]

## What Didn't Work
- [Issue 1]
- [Issue 2]

## Corrective Actions
- [Action 1 with owner and timeline]
- [Action 2 with owner and timeline]

## Recommendations
- [Long-term improvement 1]
- [Long-term improvement 2]
```

### 7.4 Update Security Controls

**Based on Incident Findings:**
1. **Update RLS Policies:**
   - Add new restrictions identified during incident
   - Fix policy gaps discovered
   - Document policy changes

2. **Enhance Monitoring:**
   - Add new alerts for similar attack patterns
   - Improve detection thresholds
   - Update runbooks

3. **Update Incident Response Plan:**
   - Incorporate lessons learned
   - Update contact information
   - Refine procedures

4. **Security Training:**
   - Share incident details with team
   - Update training materials
   - Conduct tabletop exercises

---

## Appendices

### Appendix A: Quick Reference Cards

#### SEV-1 Incident Quick Response

**IMMEDIATE ACTIONS (First 15 minutes):**
```
1. [ ] Notify Incident Commander: [CONTACT]
2. [ ] Create incident ticket: #______
3. [ ] Join war room: [LINK]
4. [ ] Take screenshot of evidence
5. [ ] Export logs (don't modify!)
6. [ ] Start incident timeline doc
```

**CONTAINMENT CHECKLIST:**
```
[ ] Identify compromised accounts
[ ] Revoke suspicious sessions
[ ] Block attacker IPs
[ ] Rotate compromised credentials
[ ] Enable enhanced monitoring
[ ] Notify executive team
```

**COMMUNICATION CHECKLIST:**
```
[ ] Internal notification sent (15 min)
[ ] Status update #1 sent (30 min)
[ ] Executive briefing (1 hour)
[ ] User notification drafted (4 hours)
[ ] Regulatory notification (72 hours)
```

### Appendix B: Security Tool Access

#### Lovable Cloud
- **URL:** https://lovable.app/[project-id]/cloud
- **Access:** Team members with Cloud access
- **Features:**
  - View edge function logs
  - Check database activity
  - Monitor authentication events
  - Manage secrets

#### Supabase Dashboard (via Lovable Cloud)
- **Database Logs:** Cloud → Database → Activity
- **Auth Logs:** Cloud → Auth → Logs
- **Edge Function Logs:** Cloud → Edge Functions → Logs

### Appendix C: Common Attack Indicators

#### Indicators of Compromise (IOCs)

**Suspicious Authentication:**
- Multiple failed login attempts from single IP (>10/5min)
- Successful login from unusual geographic location
- Login outside normal business hours
- Multiple accounts accessed from single IP

**Database Anomalies:**
- Unusual query patterns (SELECT * FROM)
- High-volume data exports
- Unauthorized RLS policy changes
- Mass data modifications
- Database connection from unexpected IPs

**Application Behavior:**
- Sudden spike in edge function errors
- Rate limit violations increasing
- Unusual API call patterns
- Unexpected file uploads to storage
- Changes to integration configurations

**Network Indicators:**
- Traffic to known malicious IPs
- Unusual outbound data transfers
- DDoS attack patterns
- Port scanning activities

### Appendix D: Communication Templates

#### Internal Slack Alert Template
```
🚨 SECURITY INCIDENT [SEV-X] 🚨

Incident ID: #______
Status: INVESTIGATING
Time: [TIMESTAMP]

Brief: [One sentence description]

War Room: [LINK]
Incident Commander: @[NAME]

Actions:
• [Action 1]
• [Action 2]

Next update: [TIME]
```

#### Status Page Update Template
```
[INVESTIGATING] We are investigating reports of [brief issue]

Posted: [TIME]
Update: [TIME] - We have identified the issue and are working on a fix.
Update: [TIME] - A fix has been implemented and we are monitoring.
Resolved: [TIME] - This incident has been resolved.
```

### Appendix E: Recovery Scripts

#### Force Password Reset (All Users)
```sql
-- Use with extreme caution - forces all users to reset password
-- Execute in Lovable Cloud → Database → SQL Editor

-- This is a destructive action!
-- Backup auth.users table first
-- UPDATE auth.users SET 
--   encrypted_password = NULL,
--   updated_at = NOW()
-- WHERE id IN (SELECT user_id FROM affected_users);
```

#### Revoke All Active Sessions
```sql
-- Revoke all sessions for specific user
-- DELETE FROM auth.sessions 
-- WHERE user_id = '[USER_ID]';

-- Revoke all sessions system-wide (EMERGENCY ONLY)
-- DELETE FROM auth.sessions;
```

#### Audit User Activity
```sql
-- Check recent activity for specific user
SELECT 
  action,
  page,
  created_at,
  metadata
FROM user_activity_logs
WHERE user_id = '[USER_ID]'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Appendix F: Regulatory Compliance

#### GDPR Requirements Checklist
```
[ ] Data breach register maintained
[ ] 72-hour notification timeline documented
[ ] DPO (if applicable) notified
[ ] Supervisory authority notification prepared
[ ] Data subject notification template ready
[ ] Cross-border breach procedures defined
[ ] Record of processing activities updated
```

#### CCPA Requirements Checklist
```
[ ] Notice to Attorney General (if >500 CA residents affected)
[ ] Individual notice within reasonable timeframe
[ ] Toll-free number for inquiries established
[ ] Free credit monitoring offered (if SSN exposed)
[ ] Incident details documented for 5 years
```

---

## Document Control

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-09 | Security Team | Initial creation |

### Review Schedule
- **Quarterly:** Review and update contact information
- **Annually:** Full plan review and update
- **Post-Incident:** Update based on lessons learned

### Approval
This plan must be reviewed and approved by:
- [ ] Chief Technology Officer
- [ ] Chief Information Security Officer
- [ ] Legal Counsel
- [ ] Compliance Officer

---

## Emergency Contacts

### 24/7 On-Call
- **Primary:** [PHONE]
- **Secondary:** [PHONE]
- **Escalation:** [PHONE]

### Critical Services
- **Lovable Support:** https://lovable.dev/support
- **Emergency Hotline:** [If available]

---

**END OF DOCUMENT**

*This document contains sensitive security information and should be protected accordingly. Distribution limited to authorized personnel only.*
