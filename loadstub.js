(function() {
  this.chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var data;
    console.log("Got loadstub query...", request);
    if (request.method === "shouldLoad") {
      data = localStorage.comp_active;
      return sendResponse({
        shouldLoad: data
      });
    } else {
      return sendResponse({});
    }
  });
}).call(this);
