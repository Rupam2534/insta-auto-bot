const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const girlNames = ["Emily", "Sophia", "Olivia", "Emma", "Ava", "Isabella", "Mia", "Charlotte", "Amelia", "Harper"];

function randomName() {
  const name = girlNames[Math.floor(Math.random() * girlNames.length)];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return name.toLowerCase() + digits;
}

function randomPassword(suffix) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass + suffix;
}

async function createAccount(suffix) {
  const username = randomName();
  const password = randomPassword(suffix);

  console.log(`🔧 Creating IG Account: ${username}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded' });

  await page.type('input[name="emailOrPhone"]', `${username}@gmail.com`, { delay: 50 });
  await page.type('input[name="fullName"]', username + " Smith", { delay: 50 });
  await page.type('input[name="username"]', username, { delay: 50 });
  await page.type('input[name="password"]', password, { delay: 50 });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  await page.close();
  await browser.close();

  return {
    username,
    password,
    twofa: 'N/A',
    email: `${username}@gmail.com`
  };
}

async function saveToCSV(accounts) {
  const writer = createCsvWriter({
    path: 'accounts.csv',
    header: [
      { id: 'username', title: 'Username' },
      { id: 'password', title: 'Password' },
      { id: 'twofa', title: '2FA' },
      { id: 'email', title: 'Email' }
    ]
  });

  await writer.writeRecords(accounts);
  console.log("✅ accounts.csv created");
}

(async () => {
  const howMany = 1;
  const suffix = "@Rupam";
  const accounts = [];

  for (let i = 0; i < howMany; i++) {
    const acc = await createAccount(suffix);
    if (acc) accounts.push(acc);
  }

  await saveToCSV(accounts);
})()
