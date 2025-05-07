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

const POSSIBLE_BUSINESS_IMPACTS = ['1 - Critical', '2 - High', '3 - Non-critical'];

const INCIDENT_STATE_CODES = {
  Analysis: '16',
  Contain: '18',
  Eradicate: '19',
  Recover: '20',
  Review: '100',
  Closed: '3',
  Cancelled: '7'
};

const INCIDENT_IMPACT_CODES = {
  '1 - Critical': '1',
  '2 - High': '2',
  '3 - Non-critical': '3'
};

const INCIDENT_PRIORITY_CODES = {
  undefined: '-- None --',
  0: '-- None --',
  1: '1 - Critical',
  2: '2 - High',
  3: '3 - Moderate',
  4: '4 - Low',
  5: '5 - Planning'
};

const INCIDENT_SEVERITY_CODES = {
  undefined: '-- None --',
  0: '-- None --',
  1: '1 - High',
  2: '2 - Medium',
  3: '3 - Low'
};

const INCIDENT_BUSINESS_IMPACT_CODES = {
  undefined: '-- None --',
  0: '-- None --',
  1: '1 - Critical',
  2: '2 - High',
  3: '3 - Non-critical'
};

const INCIDENT_STATE_OPTIONS = {
  Analysis: ['Analysis', 'Contain', 'Eradicate', 'Recover'],
  Contain: ['Contain', 'Eradicate', 'Recover', 'Review', 'Closed'],
  Eradicate: ['Contain', 'Eradicate', 'Recover', 'Review', 'Closed'],
  Recover: ['Eradicate', 'Recover', 'Review', 'Closed'],
  Review: ['Review', 'Closed'],
  Closed: ['Closed'],
  Cancelled: ['Cancelled'],
  Unknown: ['Unknown']
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
  POSSIBLE_BUSINESS_IMPACTS,
  INCIDENT_STATE_CODES,
  INCIDENT_STATE_OPTIONS,
  INCIDENT_IMPACT_CODES,
  CLOSED_CODES,
  INCIDENT_BUSINESS_IMPACT_CODES,
  INCIDENT_SEVERITY_CODES,
  INCIDENT_PRIORITY_CODES
};
