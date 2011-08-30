document = @document
is_setup = false
toggle = null
load = null

setup = ->
  is_setup = true
  comps = []
  current_comp = null

  dragging = false
  ox = 0
  oy = 0
  lx = 0
  ly = 0
  px = 0
  py = 0
  opacity = 0.5

  chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
    if request.method == "toggle"
      toggle()
    sendResponse {}

  toggle = (force) ->
    if wrapper.style.display == "none" or force
      wrapper.style.display = "block"
      if current_comp
        overlay.style.display = "block"
    else
      wrapper.style.display = "none"
      overlay.style.display = "none"
      localStorage.removeItem "comp_active"

  move_to = (x, y) ->
    lx = x
    ly = y
    save_options()
    overlay.style.left = lx + "px"
    overlay.style.top = ly + "px"

  add_image = (data, uid) ->
    image = document.createElement("div")
    image.setAttribute("data-uid", uid)
    image.id = "comp-" + uid
    image.innerHTML = "<img src='#{data}' />"
    image.setAttribute("class", "existing-image")
    image.addEventListener "click", (e) ->
      if e.ctrlKey
        if confirm "Delete this comp?"
          delete_comp this.getAttribute("data-uid")
      else if current_comp == this
        overlay.style.display = "none"
        current_comp = null
        localStorage.removeItem "comp_active"
      else
        current_comp = this
        localStorage.comp_active = this.getAttribute("data-uid")
        overlay_inner.innerHTML = this.innerHTML
        load_options()
        overlay.style.display = "block"
    selections.appendChild(image)

  load = () ->
    if localStorage["comp_list"]
      comps = JSON.parse(localStorage["comp_list"])
      console.log "Loading comps:", comps
      for comp in comps
        element = add_image localStorage["comp_data_" + comp], comp

  delete_comp = (uid) ->
    uid = parseInt(uid, 10)
    idx = comps.indexOf(uid)
    if idx > -1
      comps.splice(idx, 1)
      localStorage["comp_list"] = JSON.stringify(comps)
      localStorage.removeItem("comp_data_" + uid)
      localStorage.removeItem("comp_opt_" + uid)
      elem = document.getElementById("comp-" + uid)
      elem.parentNode.removeChild(elem)

  save_comp = (data) ->
    uid = new Date().getTime()
    comps.push uid
    localStorage["comp_data_" + uid] = data
    localStorage["comp_list"] = JSON.stringify(comps)
    uid

  save_options = ->
    data = {left: lx, top: ly, opacity: opacity}
    localStorage["comp_opt_" + current_comp.getAttribute("data-uid")] = JSON.stringify(data)

  load_options = ->
    str = localStorage["comp_opt_" + current_comp.getAttribute("data-uid")]
    if str
      data = JSON.parse(str)
      opacity = data.opacity
      lx = data.left
      ly = data.top
      overlay_inner.style.opacity = opacity
      overlay.style.left = lx + "px"
      overlay.style.top = ly + "px"
        
  wrapper = document.createElement("div")
  wrapper.id = "comps-wrapper"
  wrapper.style.display = "none"
  overlay = document.createElement("div")
  overlay.id = "comps-overlay"
  overlay_inner = document.createElement("div")
  overlay_inner.id = "comps-overlay-inner"
  overlay.appendChild(overlay_inner)
  overlay.style.display = "none"

  amounts = [[0, -1], [0, 1], [-1, 0], [1, 0]]
  for direction, index in ["up", "down", "left", "right"]
    e = document.createElement("div")
    e.id = "comp-" + direction
    f =((amt) ->
      (e) ->
        scale = if e.ctrlKey then 10 else 1
        move_to lx + (amt[0] * scale), ly + (amt[1] * scale)
      )(amounts[index])
    e.addEventListener "click", f

    overlay.appendChild(e)  

  selections = document.createElement("div")
  selections.id = "comps-selections"
  wrapper.appendChild(selections)

  dropzone = document.createElement("div")
  dropzone.setAttribute("class", "dropzone")
  dropzone.innerHTML = "Drop an<br />image here"
  wrapper.appendChild(dropzone)

  document.body.appendChild(wrapper)
  document.body.appendChild(overlay)

  dropzone.addEventListener "dragover", (e) ->
    e.stopPropagation()
    e.preventDefault()
    this.setAttribute("class", "dropzone hovering")
  , false

  dropzone.addEventListener "dragenter", (e) ->
    e.stopPropagation()
    e.preventDefault()
    this.setAttribute("class", "dropzone hovering")
  , false

  dropzone.addEventListener "dragleave", (e)->
    e.stopPropagation()
    e.preventDefault()
    this.setAttribute("class", "dropzone")  
  , false

  dropzone.addEventListener "drop", (e) ->
    e.stopPropagation()
    e.preventDefault()
    this.setAttribute("class", "dropzone")
    for file in e.dataTransfer.files
      continue if !file.type.match /image.*/
      reader = new FileReader()
      reader.onload = ((f) ->  
        (e) ->        
          uid = save_comp e.target.result
          add_image e.target.result, uid
      )(file)

      reader.readAsDataURL file
  , false

  document.addEventListener "mousemove", (e) ->
    px = e.pageX
    py = e.pageY
    if dragging
      move_to(px - ox, py - oy)
    
  overlay_inner.addEventListener "mousedown", (e) ->
    e.stopPropagation()
    e.preventDefault()
    ox = px - lx
    oy = py - ly
    dragging = true

  overlay_inner.addEventListener "mouseup", (e) ->
    e.stopPropagation()
    e.preventDefault()
    dragging = false

  overlay_inner.addEventListener "mousewheel", (e) ->
    if e.wheelDelta < 0
      opacity -= 0.025
    else
      opacity += 0.025
    if opacity < 0
      opacity = 0
    else if opacity > 1
      opacity = 1
    overlay_inner.style.opacity = opacity
    save_options()
    e.stopPropagation()
    e.preventDefault()

if not is_setup
  setup()
  load()
  if localStorage["comp_active"]    
    toggle true
    e = document.getElementById("comp-" + localStorage["comp_active"])
    evt = document.createEvent("HTMLEvents")
    evt.initEvent("click", true, true)
    e.dispatchEvent(evt)
  
else
  toggle()