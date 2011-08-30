@chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
  console.log "Got loadstub query...", request
  if request.method == "shouldLoad"
    data = localStorage.comp_active
    sendResponse({shouldLoad: data})
  else
    sendResponse({})