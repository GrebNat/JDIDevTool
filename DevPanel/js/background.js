chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        switch (request.name) {
            case requestName.executeContentScript:
                executeContextScript(request);
                break;
            case requestName.releaseElementLocationState:
                executeContextScript(request);
                break;
            case requestName.addMoseMoveKeyPressEvent:
                addMouseMoveKeyPressToPage(request);
                break;
            case requestName.jdiFromContent:
                saveJDIObjectToStorage(request.data);
                break;
            default :
                alert("no request")
        }

    });
function saveJDIObjectToStorage(data) {
    chrome.storage.local.set({'jdi_object': data});
}

function addJDIObjectToStorage(data) {
    var $a = [];
    chrome.storage.local.get("jdi_object", function (e2) {
        if (e2.jdi_object != undefined)
            $a = e2.jdi_object;
        console.log("2 from array " + $a);
        $a.push(data);
        console.log("3 from array second" + $a);
        chrome.storage.local.set({'jdi_object': $a});
    });

}

function addMouseMoveKeyPressToPage(data) {
    chrome.tabs.executeScript(data.tabId, {file: data.scriptToExecute});
}

function executeContextScript(data) {
    chrome.tabs.executeScript(data.tabId, {file: data.scriptToExecute});
}



//sending request to content_loaded

/*chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
 alert("sending msg to content_script:::2")

 chrome.tabs.sendMessage(request.tabId, "hello", function (response) {
 alert ("responce from content to background: "+response);
 });
 });*/