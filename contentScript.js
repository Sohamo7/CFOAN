(() => {
  const emailBody = document.querySelector('.a3s') || document.querySelector('.ii.gt') || document.querySelector('div[data-message-id]');
  if (emailBody) {
    return emailBody.innerText;
  } else {
    return document.body.innerText;
  }
})();