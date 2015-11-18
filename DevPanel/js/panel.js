var treeElementCount = 0;
var jdi_page_json = undefined;
var done = false;

document.addEventListener('DOMContentLoaded', function (e) {

    chrome.storage.local.clear();

    $('#btn-all').on('click', function () {
        chrome.runtime.sendMessage({
            name: requestName.savePageJSONByJDIElementsToStorage,
            pageId: chrome.devtools.inspectedWindow.tabId});
    })

    chrome.storage.onChanged.addListener(function (changed, e1) {
        jdi_page_json = changed.jdi_page.newValue;
        drawJDITree($.parseJSON(jdi_page_json), "tree");
        jdi_page_json = undefined;
    });

    $('#cb-light').on("change", function (e) {
        if ($('#cb-light').is(':checked')) {
            chrome.runtime.sendMessage(
                {
                    name: requestName.addMouseMoveKeyPressEvent,
                    scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents.js",
                    tabId: chrome.devtools.inspectedWindow.tabId
                },
                function (response) {
                })
        }
        else {
            chrome.runtime.sendMessage(
                {
                    name: requestName.releaseElementLocationState,
                    scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents_Release.js",
                    tabId: chrome.devtools.inspectedWindow.tabId
                },
                function (response) {
                })
        }
    })
});

function drawJDITree(jsonElements, parentID) {
    $.each(jsonElements.elements, function (ind, el) {
        if (el.elements.length === 0)
            addNewJDIBeanToTree(parentID, el);
        else {
            var drawnEl = addNewJDIBeanToTree(parentID, el);
            var ind = drawnEl.getAttribute("id").split("-").pop();
            drawJDITree(el, 'main-div-' + ind);
        }
    });
}

function fillJDIBean(index, jdiObject) {

    $('#jdi-name-' + index).text(jdiObject.name);
    $('#jdi-type-' + index).text(jdiObject.type);

    $('#PO-type-' + index).val(jdiObject.type);

    if (jdiObject.poName === "" | jdiObject.poName === null | jdiObject.poName === undefined) {
        $('#PO-name-' + index).val("no name").addClass("warningText");
        $('#jdi-name-col-' + index).text("no name").addClass("warningText");
    }
    else {
        $('#PO-name-' + index).val(jdiObject.poName).removeClass("warningText");
        $('#jdi-name-col-' + index).text(jdiObject.poName).removeClass("warningText");
    }
}

function addNewJDIBeanToTree(parentID, jdiElement) {

    var template = $("#template").html().replace(/{i}/g, treeElementCount);
    $("#" + parentID).append("<ul>" + template + "</ul>");

    addJDIBeanEvents(treeElementCount);
    fillJDIBean(treeElementCount, jdiElement)

    treeElementCount++;

    return $(template)[0];
}

function addJDIBeanEvents(index) {

    $('#btn-col-' + index).on('click', function () {

        var ind = this.getAttribute("id").split("-").pop();

        if ($(this).text() == "V") {
            $(this).text(">");
            $("#div-col-" + ind).css("display", "none");
            $("#div-col-none-" + ind).css("display", "block");
        }
        else {
            $(this).text("V");
            $("#div-col-" + ind).css("display", "block");
            $("#div-col-none-" + ind).css("display", "none");
        }
    });

    $('#PO-name-' + index).on('input', function () {

        var ind = this.getAttribute("id").split("-").pop();

        var txt = $('#PO-name-' + ind).val();

        $('#PO-name-' + ind).removeClass("warningText");
        $('#jdi-name-col-' + ind).removeClass("warningText")
        $('#jdi-name-col-' + ind).text(txt);
    });

    $('#btn-remove-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        $('#main-div-' + ind).remove();
    })

    $('#btn-add-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        addNewJDIBeanToTree('main-div-' + ind);
    })

    $('#div-col-' + index).on("mouseover", function () {
        $(this).addClass("highlight");
    });
    $('#div-col-' + index).on("mouseout", function () {
        $(this).removeClass("highlight");
    })
    $('#div-col-none-' + index).on("mouseover", function () {
        $(this).addClass("highlight");
    });
    $('#div-col-none-' + index).on("mouseout", function () {
        $(this).removeClass("highlight");
    })

}

