
console.log('content_loaded')

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            alert(" - request from background to content_script:::4");
            sendResponse("ok")
        });



