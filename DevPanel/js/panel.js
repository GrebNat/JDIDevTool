document.addEventListener('DOMContentLoaded', function () {

    $('#btn-all').click(function(e){ })

    $('#btn-locate').click(function(e){
        chrome.runtime.sendMessage(
            {   name:requestName.addMoseMoveKeyPressEvent,
                scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents.js",
                tabId: chrome.devtools.inspectedWindow.tabId},
            function(response){})
    })

    $('#btn-release-el-locat').click(function(e){

        chrome.runtime.sendMessage(
            {   name:requestName.releaseElementLocationState,
                scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents_Release.js",
                tabId: chrome.devtools.inspectedWindow.tabId},
            function(response){})
    })


    function displayElementTree(elementsTree) {
        //TO DO
        alert("panel responce from content_script via background scr '"+elementsTree+"'");
    }

    chrome.storage.onChanged.addListener(function (e1) {
        chrome.storage.local.get('jdi_object', function (e) {
            updateJDIObjectViewOnPanel(e);
        })
    });
});

function updateJDIObjectViewOnPanel(e){
    jdi = $('#textArea').val();
    if (jdi != e.jdi_object.asString){
        $('#textArea').text(e.jdi_object.asString);
    }
}
