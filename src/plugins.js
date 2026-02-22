window.Staminia = window.Staminia || {};
const Staminia = window.Staminia;

const copyToClipboard = (text, button) => {
  if (!navigator.clipboard) return;

  const originalText = button.textContent;
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = Staminia.messages.copied_to_clipboard;
    setTimeout(() => { button.textContent = originalText; }, 2000);
  });
};

Staminia.copyToClipboard = copyToClipboard;
