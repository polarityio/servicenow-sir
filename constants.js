const CATEGORIES_WITH_SUBCATEGORIES = {
  'Confidential personal identity data exposure': [
    'Credit card information',
    'Identity theft',
    'Other',
    'Social Security Numbers with or without names'
  ],
  'Criminal activity/investigation': [
    'Child pornography',
    'Online theft, fraud',
    'Physical theft, break-in',
    'Subpoena, search warrant, or other court order',
    'Threatening communication'
  ],
  'Denial of Service': [
    'Inbound or outbound',
    'Single or distributed (DoS or DDoS)',
    'Inbound DDos',
    'Outbound DDos',
    'Inbound Dos',
    'Outbound Dos'
  ],
  'Digital Millennium Copyright Act (DMCA) violation': [
    'Illegal distribution of copyrighted or licensed material',
    'Illegal possession of copyrighted or licensed material',
    'Official DMCA notification from copyright owner or legal representative'
  ],
  'Equipment loss': ['Lost equipment', 'Stolen equipment'],
  'Malicious code activity': ['Botnet', 'Keylogger', 'Rootkit', 'Worm, virus, Trojan'],
  'No Incident': [
    'When investigation of suspicious activity finds no evidence of a security incident'
  ],
  'Policy violation': [
    'Company policy violation',
    'Personnel action/investigation',
    'Violation of code of conduct'
  ],
  'Privilege Escalation': ['Active Directory Domain Admin', 'Application Admin'],
  'Reconnaissance activity': [
    'Other vulnerability scanning',
    'Port scanning',
    'Unauthorized monitoring'
  ],
  'Rogue server or service': [
    'Botnet controller',
    'Phishing scam web server',
    'Rogue file/FTP server for music, movies, pirated software, etc.'
  ],
  'Spam source': ['Spam host', 'Spam relay'],
  Phishing: ['Scam e-mail activity', 'Spear phishing', 'Large Campaign'],
  'Un-patched vulnerability': [
    'Vulnerable application',
    'Vulnerable operating system',
    'Vulnerable web site/service',
    'Weak or no password on an account'
  ],
  'Unauthorized access': [
    'Abuse of access privileges',
    'Brute force password cracking attempts',
    'Stolen password(s)',
    'Unauthorized access to data',
    'Unauthorized login attempts'
  ],
  'Web/BBS defacement': [
    'Defacement of web site',
    'Inappropriate post to BBS, wiki, blog, etc.',
    'Redirected web site'
  ],
  'Shared Intelligence': [],
  'Failed Login': [],
  'Lost or stolen laptop': [],
  Malware: [
    'Ransomeware',
    'C&amp;C Communication inbound',
    'C&amp;C communication outbound'
  ],
  'Insider Breach': []
};

const INCIDENT_STATE_CODES = {
  Analysis: "16",
  Contain: "18",
  Eradicate: "19",
  Recover: "20",
  Review: "100",
  Closed: "3"
};

const INCIDENT_STATE_OPTIONS = {
  Analysis: ['Analysis', 'Contain', 'Eradicate', 'Recover'],
  Contain: ['Contain', 'Eradicate', 'Recover', 'Review', 'Closed'],
  Eradicate: ['Eradicate', 'Contain', 'Recover', 'Review', 'Closed'],
  Recover: ['Recover', 'Eradicate', 'Review', 'Closed'],
  Review: ['Review', 'Closed'],
  Closed: ['Closed']
};
const CLOSED_CODES = {
  'Investigation completed': '100',
  'Threat mitigated': '101',
  'Patched vulnerability': '102',
  'Invalid vulnerability': '1',
  'Not resolved': '-100',
  'False positive': '2'
};

module.exports = {
  CATEGORIES_WITH_SUBCATEGORIES,
  INCIDENT_STATE_CODES,
  INCIDENT_STATE_OPTIONS,
  CLOSED_CODES
};
