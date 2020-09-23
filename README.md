# Polarity ServiceNow Security Incident Response (SIR) Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

Polarity's ServiceNow Security Incident Response (SIR) Integration allows the lookup of ServiceNow security incidents (e.g. SIR00000012), and Observables including IP addresses, CVE's, web domains, file hashes and e-mail addresses against your instance of ServiceNow.

To learn more about ServiceNow Security Incident Response (SIR), visit the [official website](https://docs.servicenow.com/bundle/orlando-security-management/page/product/security-incident-response/reference/sir-landing-page.html).

## ServiceNow Security Incident Response (SIR) Integration Options

### ServiceNow Server URL
The URL for your ServiceNow server which should include the schema (i.e., http, https) and port if required

### Username
The username of the Service Now user you want the integration to authenticate as.  The user should have permissions to access the `sys_user`, `sn_si_incident`, and `sn_ti_observable` tables.

### Password
The password for the provided username you want the integration to authenticate as.

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
