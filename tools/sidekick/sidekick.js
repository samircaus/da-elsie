import toggleScheduler from '../scheduler/scheduler.js';

const getSk = () => document.querySelector('aem-sidekick');

const loadQuickEdit = async (...args) => {
  // eslint-disable-next-line import/no-cycle
  const { default: initQuickEdit } = await import('../quick-edit/quick-edit.js');
  initQuickEdit(...args);
};

async function ready(sk) {
  sk.classList.add('is-ready');
  sk.addEventListener('custom:scheduler', toggleScheduler);
  sk.addEventListener('custom:quick-edit', loadQuickEdit);
}

(async function loadSidekick() {
  const sk = getSk() || await new Promise((resolve) => {
    document.addEventListener('sidekick-ready', () => resolve(getSk()));
  });
  ready(sk);
}());
