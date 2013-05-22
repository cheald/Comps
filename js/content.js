(function() {
  var document, e, evt, is_setup, load, setup, toggle;
  document = this.document;
  is_setup = false;
  toggle = null;
  load = null;
  setup = function() {
    var add_image, amounts, comps, current_comp, delete_comp, direction, dragging, dropzone, e, f, index, load_options, lx, ly, move_to, opacity, overlay, overlay_inner, ox, oy, px, py, save_comp, save_options, selections, wrapper, _len, _ref;
    is_setup = true;
    comps = [];
    current_comp = null;
    dragging = false;
    ox = 0;
    oy = 0;
    lx = 0;
    ly = 0;
    px = 0;
    py = 0;
    opacity = 0.5;
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      if (request.method === "toggle") {
        toggle();
      }
      return sendResponse({});
    });
    toggle = function(force) {
      if (wrapper.style.display === "none" || force) {
        wrapper.style.display = "block";
        if (current_comp) {
          return overlay.style.display = "block";
        }
      } else {
        wrapper.style.display = "none";
        overlay.style.display = "none";
        return localStorage.removeItem("comp_active");
      }
    };
    move_to = function(x, y) {
      lx = x;
      ly = y;
      save_options();
      overlay.style.left = lx + "px";
      return overlay.style.top = ly + "px";
    };
    add_image = function(data, uid) {
      var image;
      image = document.createElement("div");
      image.setAttribute("data-uid", uid);
      image.id = "comp-" + uid;
      image.innerHTML = "<img src='" + data + "' />";
      image.setAttribute("class", "existing-image");
      image.addEventListener("click", function(e) {
        if (e.ctrlKey || e.altKey) {
          if (confirm("Delete this comp?")) {
            return delete_comp(this.getAttribute("data-uid"));
          }
        } else if (current_comp === this) {
          overlay.style.display = "none";
          current_comp = null;
          return localStorage.removeItem("comp_active");
        } else {
          current_comp = this;
          localStorage.comp_active = this.getAttribute("data-uid");
          overlay_inner.innerHTML = this.innerHTML;
          load_options();
          return overlay.style.display = "block";
        }
      });
      return selections.appendChild(image);
    };
    load = function() {
      var comp, element, _i, _len, _results;
      if (localStorage["comp_list"]) {
        comps = JSON.parse(localStorage["comp_list"]);
        _results = [];
        for (_i = 0, _len = comps.length; _i < _len; _i++) {
          comp = comps[_i];
          _results.push(element = add_image(localStorage["comp_data_" + comp], comp));
        }
        return _results;
      }
    };
    delete_comp = function(uid) {
      var elem, idx;
      uid = parseInt(uid, 10);
      idx = comps.indexOf(uid);
      if (idx > -1) {
        comps.splice(idx, 1);
        localStorage["comp_list"] = JSON.stringify(comps);
        localStorage.removeItem("comp_data_" + uid);
        localStorage.removeItem("comp_opt_" + uid);
        elem = document.getElementById("comp-" + uid);
        return elem.parentNode.removeChild(elem);
      }
    };
    save_comp = function(data) {
      var uid;
      uid = new Date().getTime();
      comps.push(uid);
      localStorage["comp_data_" + uid] = data;
      localStorage["comp_list"] = JSON.stringify(comps);
      return uid;
    };
    save_options = function() {
      var data;
      data = {
        left: lx,
        top: ly,
        opacity: opacity
      };
      return localStorage["comp_opt_" + current_comp.getAttribute("data-uid")] = JSON.stringify(data);
    };
    load_options = function() {
      var data, str;
      str = localStorage["comp_opt_" + current_comp.getAttribute("data-uid")];
      if (str) {
        data = JSON.parse(str);
        opacity = data.opacity;
        lx = data.left;
        ly = data.top;
        overlay_inner.style.opacity = opacity;
        overlay.style.left = lx + "px";
        return overlay.style.top = ly + "px";
      }
    };
    wrapper = document.createElement("div");
    wrapper.id = "comps-wrapper";
    wrapper.style.display = "none";
    overlay = document.createElement("div");
    overlay.id = "comps-overlay";
    overlay_inner = document.createElement("div");
    overlay_inner.id = "comps-overlay-inner";
    overlay.appendChild(overlay_inner);
    overlay.style.display = "none";
    amounts = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    _ref = ["up", "down", "left", "right"];
    for (index = 0, _len = _ref.length; index < _len; index++) {
      direction = _ref[index];
      e = document.createElement("div");
      e.id = "comp-" + direction;
      f = (function(amt) {
        return function(e) {
          var scale;
          scale = e.ctrlKey ? 10 : 1;
          return move_to(lx + (amt[0] * scale), ly + (amt[1] * scale));
        };
      })(amounts[index]);
      e.addEventListener("click", f);
      overlay.appendChild(e);
    }
    selections = document.createElement("div");
    selections.id = "comps-selections";
    wrapper.appendChild(selections);
    dropzone = document.createElement("div");
    dropzone.setAttribute("class", "dropzone");
    dropzone.innerHTML = "Drop an<br />image here";
    wrapper.appendChild(dropzone);
    document.body.appendChild(wrapper);
    document.body.appendChild(overlay);
    dropzone.addEventListener("dragover", function(e) {
      e.stopPropagation();
      e.preventDefault();
      return this.setAttribute("class", "dropzone hovering");
    }, false);
    dropzone.addEventListener("dragenter", function(e) {
      e.stopPropagation();
      e.preventDefault();
      return this.setAttribute("class", "dropzone hovering");
    }, false);
    dropzone.addEventListener("dragleave", function(e) {
      e.stopPropagation();
      e.preventDefault();
      return this.setAttribute("class", "dropzone");
    }, false);
    dropzone.addEventListener("drop", function(e) {
      var file, reader, _i, _len2, _ref2, _results;
      e.stopPropagation();
      e.preventDefault();
      this.setAttribute("class", "dropzone");
      _ref2 = e.dataTransfer.files;
      _results = [];
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        file = _ref2[_i];
        if (!file.type.match(/image.*/)) {
          continue;
        }
        reader = new FileReader();
        reader.onload = (function(f) {
          return function(e) {
            var uid;
            uid = save_comp(e.target.result);
            return add_image(e.target.result, uid);
          };
        })(file);
        _results.push(reader.readAsDataURL(file));
      }
      return _results;
    }, false);
    document.addEventListener("mousemove", function(e) {
      px = e.pageX;
      py = e.pageY;
      if (dragging) {
        return move_to(px - ox, py - oy);
      }
    });
    overlay_inner.addEventListener("mousedown", function(e) {
      e.stopPropagation();
      e.preventDefault();
      ox = px - lx;
      oy = py - ly;
      return dragging = true;
    });
    overlay_inner.addEventListener("mouseup", function(e) {
      e.stopPropagation();
      e.preventDefault();
      return dragging = false;
    });
    return overlay_inner.addEventListener("mousewheel", function(e) {
      if (e.wheelDelta < 0) {
        opacity -= 0.025;
      } else {
        opacity += 0.025;
      }
      if (opacity < 0) {
        opacity = 0;
      } else if (opacity > 1) {
        opacity = 1;
      }
      overlay_inner.style.opacity = opacity;
      save_options();
      e.stopPropagation();
      return e.preventDefault();
    });
  };
  if (!is_setup) {
    setup();
    load();
    if (localStorage["comp_active"]) {
      toggle(true);
      e = document.getElementById("comp-" + localStorage["comp_active"]);
      evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);
      e.dispatchEvent(evt);
    }
  } else {
    toggle();
  }
}).call(this);
