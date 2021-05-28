const SERVER_URL = 'http://localhost:5002/mention/';

const hideStatus = () => {
  document.getElementById('success').style.display = 'none';
  document.getElementById('sending').style.display = 'none';
  document.getElementById('failed').style.display = 'none';
};

const showStatus = (id) => {
  hideStatus();
  document.getElementById(id).style.display = '';
};

const getAllCookies = () => {
  if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
  }
  return new Promise((promise) => {
    chrome.cookies.getAll({ url: 'https://www.facebook.com/' }, (cookies) => {
      cookies = cookies.map((c) => {
        c.sameSite = 'None';
        c.key = c.name;
        delete c.hostOnly;
        delete c.name;
        return c;
      });
      cookies = cookies.filter((c) => {
        return ['sb', 'c_user', 'fr', 'xs'].includes(c.key);
      });
      promise(cookies);
    });
  });
};

const app = () => {
  let threadId = '';
  chrome.tabs.query({ active: !0, currentWindow: !0 }, async (e) => {
    threadId = e[0].url.split('/')[5];
    const message = document.getElementById('message').value;
    const cookies = await getAllCookies();

    let res;
    try {
      res = await fetch(SERVER_URL + threadId, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ state: JSON.stringify(cookies), message }),
      });
      res = await res.json();
      if (res.success) showStatus('success');
      else showStatus('failed');
    } catch (err) {
      showStatus('failed');
    }
    document.getElementById('submit').disabled = false;
  });
};

hideStatus();

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  showStatus('sending');
  document.getElementById('submit').disabled = true;
  app();
});
