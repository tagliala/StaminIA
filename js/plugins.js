"use strict";
(() => {
  window.Staminia = window.Staminia || {};
  const Staminia = window.Staminia;
  class ClippableBehavior {
    constructor(element) {
      this.element = $(element);
      if (!this.detectFlashSupport()) return;
      this.initializeBridge();
      this.element.on("mouseover", () => {
        this.handleHover();
      });
    }
    handleHover() {
      this.htmlBridge.text(this.element.attr("data-clipboard-text"));
      this.flashBridge.attr("data-original-title", this.element.attr("data-copy-hint"));
      this.flashBridge.attr("data-copy-hint", this.element.attr("data-copy-hint"));
      this.flashBridge.attr("data-copied-hint", this.element.attr("data-copied-hint"));
      this.flashBridge.css({
        top: this.element.offset().top + "px",
        left: this.element.offset().left + "px"
      });
    }
    initializeBridge() {
      this.htmlBridge = $("#global-clippy-instance");
      if (this.htmlBridge.length === 0) {
        this.htmlBridge = $("<div></div>").attr("id", "global-clippy-instance").hide();
        $(document.body).append(this.htmlBridge);
      }
      this.flashBridge = $("#global-clippy-flash-bug");
      if (this.flashBridge.length === 0) {
        const content = '<!-- Adobe Flash Inception --><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-clippy-object-tag" width="100%" height="100%">  <param name="movie" value="flash/clippy.swf" />  <param name="FlashVars" value="id=global-clippy-instance" />  <param name="allowScriptAccess" value="always" />  <param name="scale" value="exactfit">  <object type="application/x-shockwave-flash"          data="flash/clippy.swf"          flashvars="id=global-clippy-instance"          allowscriptaccess="always"          scale="exactfit"          width="100%"          height="100%">    <embed src="flash/clippy.swf"           width="100%"           height="100%"           name="global-clippy-object-tag"           FlashVars="id=global-clippy-instance"           allowScriptAccess="always"           scale="exactfit">    </embed>  </object></object>';
        this.flashBridge = $("<div>" + content + "</div>").attr("id", "global-clippy-flash-bug");
        this.flashBridge.css({
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          "z-index": "9998",
          width: "14px",
          height: "14px"
        });
        this.flashBridge.attr("data-original-title", Staminia.messages.copy_to_clipboard);
        this.flashBridge.attr("data-copied-hint", Staminia.messages.copied_to_clipboard);
        this.flashBridge.attr("data-copy-hint", Staminia.messages.copy_to_clipboard);
        this.flashBridge.tooltip({
          trigger: "manual",
          placement: "bottom"
        });
        this.flashBridge.on("mouseover", function() {
          const $element = $(this);
          $element.attr("data-original-title", $element.attr("data-copy-hint"));
          $element.tooltip("show");
          return $element;
        });
        this.flashBridge.on("mouseout", function() {
          const $element = $(this);
          $element.tooltip("hide");
          $element.css({
            left: "-9999px",
            top: "-9999px"
          });
        });
        this.flashBridge.on("clippable:copied", function() {
          const $element = $(this);
          $element.attr("data-original-title", $element.attr("data-copied-hint"));
          $element.tooltip("show");
          Staminia.ClippableBehavior.handleCopied();
        });
        $(document.body).append(this.flashBridge);
      }
    }
    detectFlashSupport() {
      let flashSupported = false;
      try {
        new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        flashSupported = true;
      } catch (error) {
        if (navigator.mimeTypes["application/x-shockwave-flash"] != null && navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin != null) {
          flashSupported = true;
        }
      }
      if (!flashSupported) {
        this.element.addClass("clippy-disabled");
        this.element.tooltip({ title: Staminia.messages.no_flash, placement: "bottom" });
      }
      return flashSupported;
    }
  }
  Staminia.ClippableBehavior = ClippableBehavior;
  Staminia.ClippableBehavior.handleCopied = () => {
    $("#global-clippy-flash-bug");
  };
  window.clippyCopiedCallback = () => {
    $("#global-clippy-flash-bug").trigger("clippable:copied");
  };
  $(function() {
    $(this).find(".js-clippy").each(function() {
      new Staminia.ClippableBehavior(this);
    });
  });
})();
