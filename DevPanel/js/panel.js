var treeElementCount = 0;

document.addEventListener('DOMContentLoaded', function (e) {

    $('#btn-all').on('click', function(){addNewJDIToTree();} )

    function displayElementTree(elementsTree) {
        //TO DO
        alert("panel responce from content_script via background scr '"+elementsTree+"'");
    }

    chrome.storage.onChanged.addListener(function (e1) {
        chrome.storage.local.get('jdi_object', function (e) {
            updateJDIObjectViewOnPanel(e);
        })
    });

    $('#cb-light').on("change", function (e){
        if ( $('#cb-light').is(':checked')){
            chrome.runtime.sendMessage(
                {   name:requestName.addMouseMoveKeyPressEvent,
                    scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents.js",
                    tabId: chrome.devtools.inspectedWindow.tabId},
                function(response){})
        }
        else{
            chrome.runtime.sendMessage(
                {   name:requestName.releaseElementLocationState,
                    scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents_Release.js",
                    tabId: chrome.devtools.inspectedWindow.tabId},
                function(response){})
        }
    })
});

function updateJDIObjectViewOnPanel(e){

    $('#jdi-name0').text(e.jdi_object.name);
    $('#jdi-type0').text(e.jdi_object.type);

    $('#PO-name0').val(e.jdi_object.name);
    $('#PO-type0').val(e.jdi_object.type);

    $('#jdi-name-col0').text(e.jdi_object.name);
}

function addNewJDIToTree(){
    treeElementCount = treeElementCount;
    var template = $("#template").html().replace(/{i}/g,treeElementCount);
    $("#tree").append(template);

    $('#btn-col'+treeElementCount).on('click', function(){

        var ind = this.getAttribute("id")[this.getAttribute("id").length-1];

        if ($(this).text() == "V") {
            $(this).text(">");
            $("#div-col"+ind).css("display", "none");
            $("#div-col-none"+ind).css("display", "block");
        }
        else {
            $(this).text("V");
            $("#div-col"+ind).css("display", "block");
            $("#div-col-none"+ind).css("display", "none");
        }
    });

    $('#PO-name'+treeElementCount).on('input', function(){

        var ind = this.getAttribute("id")[this.getAttribute("id").length-1];

        var txt = $('#PO-name'+ind).val();
        $('#jdi-name-col'+ind).text(txt);
    });

    treeElementCount++;
}
