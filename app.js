
console.log('Starting password manager...');
var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
  // Create account command
  .command('create', 'Creates new account', function(yargs) {
      yargs.options({
        name: {
          demand: true,
          alias: 'n',
          description: 'The account name goes here, e.g. Facebook',
          type: 'string',
        },
        username: {
          demand: true,
          alias: 'u',
          description: 'Your username for the account goes here',
          type: 'string',
        },
        password: {
          demand: true,
          alias: 'p',
          description: 'Your password for the account goes here',
          type: 'string',
        },
        masterPassword: {
          demand: true,
          alias: 'm',
          description: 'Master password',
          type: 'string',
        },
      }).help('help');
  })
  // Get account command
  .command('get', 'Retrieves specified account', function(yargs) {
      yargs.options({
        name: {
          demand: true,
          alias: 'n',
          description: 'The account name goes here, e.g. Facebook',
          type: 'string',
        },
        masterPassword: {
          demand: true,
          alias: 'm',
          description: 'Master password',
          type: 'string',
        },
      }).help('help');
  })
  .help('help')
  .argv;

// Grab command argument
var command = argv._[0];

// Get accounts function
function getAccounts(masterPassword) {
  // use getItemSync to fetch accounts
  var encryptedAccounts = storage.getItemSync('accounts');
  var accounts = [];
  // decrypt
  if (typeof encryptedAccounts !== 'undefined') {
    var bytes = crypto.AES.decrypt(encryptedAccounts, masterPassword);
    var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
  }
  // return accounts array
  return accounts;
}

// Save accounts function
function saveAccounts (accounts, masterPassword) {
  // encrypt accounts
  var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
  // setItemSync to save
  storage.setItemSync('accounts', encryptedAccounts.toString());
  // return accounts array
  return accounts;

}

// Create account function
function createAccount (account, masterPassword) {
  var accounts = getAccounts(masterPassword);
  accounts.push(account);

  saveAccounts(accounts, masterPassword);

  return account;
}

// Retrieve account function
function getAccount (accountName, masterPassword) {
  var accounts = getAccounts(masterPassword);
  var matchedAccount;

  accounts.forEach(function (account) {
    if (account.name === accountName) {
      matchedAccount = account;
    }
  });
  return matchedAccount;
}

// Parse command and call related function
if (command === 'create') {
  try {
    account = {
      name: argv.name,
      username: argv.username,
      password: argv.password,
    };
    console.log("Creating new account...");
    var newAccount = createAccount(account, argv.masterPassword);
    console.log('New account created.');
    console.log('Account Name: ' + newAccount['name']);
    console.log('Username: ' + newAccount['username']);
    console.log('Password: ' + newAccount['password']);
  } catch (err) {
    console.log('**Unable to create account**');
  }

} else if (command === 'get'){
  try {
    console.log('Retrieving account information...');
    accountName = argv.name;
    var fetchedAccount = getAccount(accountName, argv.masterPassword);
      if (fetchedAccount === 'undefined') {
        console.log('Account not found.');
      } else {
        console.log('**ACCOUNT INFORMATION**');
        console.log('Account Name: ' + fetchedAccount['name']);
        console.log('Username: ' + fetchedAccount['username']);
        console.log('Password: ' + fetchedAccount['password']);
        console.log('***********************');
      }
    } catch (err) {
      console.log('**Unable to fetch account**');
    }
} else {
  console.log('I don\'t understand that command');
}
