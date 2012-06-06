###global Enumerator: false, ActiveXObject: false###
"use strict";
window.Staminia = window.Staminia || {}
Staminia = window.Staminia
class ClippableBehavior
  constructor: (element) ->
    @element = $(element)
    return unless @detectFlashSupport()
    @initializeBridge()
    @element.on "mouseover", =>
      @handleHover()
  handleHover: ->
    @htmlBridge.text @element.attr("data-clipboard-text")
    @flashBridge.attr "data-original-title", @element.attr("data-copy-hint")
    @flashBridge.attr "data-copy-hint", @element.attr("data-copy-hint")
    @flashBridge.attr "data-copied-hint", @element.attr("data-copied-hint")
    @flashBridge.css
      top: @element.offset().top + "px"
      left: @element.offset().left + "px"
  
  initializeBridge: ->
    @htmlBridge = $("#global-clippy-instance")
    if @htmlBridge.length is 0
      @htmlBridge = $("<div></div>").attr("id", "global-clippy-instance").hide()
      $(document.body).append(@htmlBridge)
    @flashBridge = $("#global-clippy-flash-bug")
    if @flashBridge.length is 0
      content =
        """
        <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" id=\"global-clippy-object-tag\" width=\"100%\" height=\"100%\">
          <param name=\"movie\" value=\"flash/clippy.swf\"/>\n  <param name=\"FlashVars\" value=\"id=global-clippy-instance\">
          <param name=\"allowScriptAccess\" value=\"always\" />\n  <param name=\"scale\" value=\"exactfit\">
          <embed src=\"flash/clippy.swf\"
                 width=\"100%\" height=\"100%\"
                 name=\"global-clippy-object-tag\"
                 FlashVars=\"id=global-clippy-instance\"
                 allowScriptAccess=\"always\"
                 scale=\"exactfit\">
          </embed>
        </object>
        """
      @flashBridge = $("<div>" + content + "</div>").attr("id", "global-clippy-flash-bug")
      @flashBridge.css
        position: "absolute"
        left: "-9999px"
        top: "-9999px"
        "z-index": "9998"
        width: "14px"
        height: "14px"
      @flashBridge.attr "data-original-title", Staminia.messages.copy_to_clipboard
      @flashBridge.attr "data-copied-hint", Staminia.messages.copied_to_clipboard
      @flashBridge.attr "data-copy-hint", Staminia.messages.copy_to_clipboard
      @flashBridge.tooltip
        trigger: "manual"
        placement: "bottom"
      @flashBridge.on "mouseover", ->
        $element = $(this)
        $element.attr "data-original-title", $element.attr("data-copy-hint")
        $element.tooltip "show"
        $element
      @flashBridge.on "mouseout", ->
        $element = $(this)
        $element.tooltip "hide"
        $element.css
          left: "-9999px"
          top: "-9999px"
      @flashBridge.on("clippable:copied", ->
        $element = $(this)
        $element.attr "data-original-title", $element.attr("data-copied-hint")
        $element.tooltip "show"
        Staminia.ClippableBehavior.handleCopied()
      )
      $(document.body).append(@flashBridge)
    return
  detectFlashSupport: ->
    flashSupported = false
    try
      new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
      flashSupported = true
    catch error
      flashSupported = true if navigator.mimeTypes["application/x-shockwave-flash"]? and navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin?
    unless flashSupported
      @element.addClass "clippy-disabled"
      @element.tooltip { "title":Staminia.messages.no_flash, "placement" : "bottom" }
    flashSupported

Staminia.ClippableBehavior = ClippableBehavior
Staminia.ClippableBehavior.handleCopied = ->
  $("#global-clippy-flash-bug")
window.clippyCopiedCallback = ->
  $("#global-clippy-flash-bug").trigger "clippable:copied"
$(->
  $(this).find(".js-clippy").each ->
    new Staminia.ClippableBehavior(this)
)