"use strict";

window.Staminia = window.Staminia || {};
const Staminia = window.Staminia;

const copyToClipboard = (text, $button) => {
  if (!navigator.clipboard) return;

  const originalText = $button.text();
  navigator.clipboard.writeText(text).then(() => {
    $button.text(Staminia.messages.copied_to_clipboard);
    setTimeout(() => $button.text(originalText), 2000);
  });
};

Staminia.copyToClipboard = copyToClipboard;
