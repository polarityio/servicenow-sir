module.exports = {
  name: 'ServiceNow Security Incident Response (SIR)',
  acronym: 'SNSIR',
  description:
    'ServiceNow Security Incident Response (SIR) allows your organization to manage the life cycle of your security incidents from initial analysis to containment, eradication, and recovery.',
  entityTypes: ['IPv4', 'email', 'domain', 'MD5', 'SHA1', 'SHA256', 'cve'],
  defaultColor: 'light-purple',
  customTypes: [
    {
      key: 'incident',
      regex: '(SN)?SIR[0-9]{7,}'
    },
    {
      key: 'task',
      regex: 'SIT[0-9]{7,}'
    }
  ],
  styles: ['./styles/service-now.less'],
  block: {
    component: {
      file: './components/service-now-block.js'
    },
    template: {
      file: './templates/service-now-block.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: ''
  },
  logging: {
    level: 'info'
  },
  options: [
    {
      key: 'url',
      name: 'URL',
      description:
        'The URL of the ServiceNow instance to connect to including the schema (i.e., https://)',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: false
    },
    {
      key: 'username',
      name: 'Username',
      description: 'The username to login to ServiceNow with',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'password',
      name: 'Password',
      description: 'The password to login to ServiceNow with',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description:
        'The API Key used to access ServiceNow Rest API.  If this is being used, then you will not need to use a Username and Password. This API Key will be prioritized over the username password combination.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKeyHeader',
      name: 'API Key Request Header Name',
      description:
        'The API Key request header to be used if authenticating via API Key.  Defaults to `x-sn-apikey`.',
      default: 'x-sn-apikey',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
