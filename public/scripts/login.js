const messages = {
    ja: "※許可されたアカウントのみアクセス可能です",
    en: "*Access is restricted to authorized accounts only",
    es: "*El acceso está restringido solo a cuentas autorizadas",
    ko: "*허가된 계정만 액세ス 가능합니다",
    zh: "*仅限授权帳戶訪問"
};

const userLang = navigator.language || navigator.userLanguage;
const langCode = userLang.split('-')[0];

const noticeElement = document.getElementById('auth-notice');
noticeElement.innerText = messages[langCode] || messages['en'];

