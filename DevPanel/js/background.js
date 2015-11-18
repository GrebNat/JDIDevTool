chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        switch (request.name) {
            case requestName.executeContentScript:
                executeContextScript(request);
                break;
            case requestName.releaseElementLocationState:
                executeContextScript(request);
                break;
            case requestName.addMouseMoveKeyPressEvent:
                addMouseMoveKeyPressToPage(request);
                break;
            case requestName.jdiFromContent:
                saveJDIObjectToStorage(request.data);
                break;
            case requestName.savePageJSONByJDIElementsToStorage:
                savePageJSONByJDIElementsToStorage(request.pageId);
                break;
            default :
                alert("request "+request.name+" not supported in background")
        }

    });

function savePageJSONByJDIElementsToStorage(pageId){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(pageId, requestName.getPageJSONByJDIElements, function(response) {
            saveToLocalStorage(response, storageSegment.jdi_page);
        });
    });
}

function saveToLocalStorage(obj, segmentName){

    chrome.storage.local.set({jdi_page: obj});
}

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