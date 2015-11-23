var treeElementCount = 0;
var jdi_page_json = undefined;
var tree_json = [];
var done = false;

document.addEventListener('DOMContentLoaded', function (e) {

    chrome.storage.local.clear();

    $('#btn-all').on('click', function () {
        cleanTreeAndTabs();

        chrome.runtime.sendMessage({
            name: requestName.savePageJSONByJDIElementsToStorage,
            pageId: chrome.devtools.inspectedWindow.tabId
        });
    })

    $('#btn-new-json').on('click', function () {
        rebuildPageObjectPreviewTab();
        /*tree_json = undefined;
        tree_json = getJSONFromTree("tree", tree_json);

        $('.tab-link').empty();
        $('.content-area').empty();

        $.each(translateToJava2(tree_json), function (ind, val) {
            addPageObjectPreviewTab(getJavaStr([val]), val.name)
        })*/
    })

    $('#btn-empty-tree').on('click', function () {
        cleanTreeAndTabs();
    })

    chrome.storage.onChanged.addListener(function (changed, e1) {
        if ('jdi_page' in changed) {
            jdi_page_json = changed.jdi_page.newValue;

            drawJDITree($.parseJSON(jdi_page_json), "tree");
            populatePageInfo($.parseJSON(jdi_page_json));

            $.each(translateToJava2($.parseJSON(jdi_page_json)), function (ind, val) {
                addPageObjectPreviewTab(val.data, val.name);
            })

            jdi_page_json = undefined;
            chrome.storage.local.remove('jdi_page');
        }
        if ('jdi_object' in changed) {
            ind = $(".staticHighlight [id^='PO-name-']")[0].getAttribute("id").split("-").pop();

            fillJDIBean(ind, changed.jdi_object.newValue);
        }
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

//draw JDI Tree
function drawJDITree(jsonElements, parentID) {
    $.each(jsonElements.elements, function (ind, el) {
        if (el.elements === undefined)
            addNewJDIBeanToTree(parentID, el);
        else {
            var drawnEl = addNewJDIBeanToTree(parentID, el);
            var ind = drawnEl.getAttribute("id").split("-").pop();
            drawJDITree(el, 'main-div-' + ind);
        }
    });
}

function fillJDIBean(index, jdiObj) {

    $('#jdi-name-' + index).text(jdiObj === undefined ? "no jdi-name" : jdiObj.name);
    $('#jdi-type-' + index).text(jdiObj === undefined ? "no jdi-type" : jdiObj.type);

    $('#PO-type-' + index).val(jdiObj === undefined ? "no type" : jdiObj.type);

    if (jdiObj === undefined) {
        $('#PO-name-' + index).val("no name").addClass("warningText");
        $('#jdi-name-col-' + index).text("no name").addClass("warningText");
    }
    else {

        $('#PO-gen-' + index).val(jdiObj.gen === undefined ? "" : jdiObj.gen);

        if (jdiObj.name === "" | jdiObj.name === null | jdiObj.name === undefined) {
            $('#PO-name-' + index).val("no name").addClass("warningText");
            $('#jdi-name-col-' + index).text("no name").addClass("warningText");
        }
        else {
            $('#PO-name-' + index).val(jdiObj.name).removeClass("warningText");
            $('#jdi-name-col-' + index).text(jdiObj.name).removeClass("warningText");
        }

        if (jdiObj.locator === "" | jdiObj.locator === null | jdiObj.locator === undefined) {
            $('#PO-locator-' + index).val("no locator").addClass("warningText");
        }
        else {
            $('#PO-locator-' + index).val(jdiObj.locator).removeClass("warningText");
        }
    }
}

function addNewJDIBeanToTree(parentID, jdiElement) {

    var template = $("#template").html().replace(/{i}/g, treeElementCount);

    if ($("#" + parentID).children('ul').length === 0)
        $("#" + parentID).append("<ul>" + template + "</ul>")
    else
        $("#" + parentID).children('ul').append(template)

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

        rebuildPageObjectPreviewTab();
    });

    $('#btn-remove-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        //  wind =  window.confirm("what to do with sub-elements?");

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
    });

    $('#cb-locate-' + index).on('change', function () {
        var ind = this.getAttribute("id").split("-").pop();
        addEventToBeansCheckBox(ind);
    })

}

function cleanTreeAndTabs() {
    $('#tree').empty();

    $('.tab-link').empty();
    $('.content-area').empty();
}

function addEventToBeansCheckBox(ind) {

    if ($('#cb-locate-' + ind).is(':checked')) {

        $.each($('#tree  .staticHighlight'), function (i, val) {
            $(this).removeClass("staticHighlight");
        });
        $.each($('#tree input[id^=cb-locate]'), function (i, val) {
            if (this.getAttribute("id").split("-").pop() !== ind)
                $(this).removeAttr("checked");
        });
        chrome.runtime.sendMessage(
            {
                name: requestName.addMouseMoveKeyPressEvent,
                scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents_Release.js",
                tabId: chrome.devtools.inspectedWindow.tabId
            })

        $('#div-col-none-' + ind).addClass("staticHighlight");
        $('#div-col-' + ind).addClass("staticHighlight");
        chrome.runtime.sendMessage(
            {
                name: requestName.addMouseMoveKeyPressEvent,
                scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents.js",
                tabId: chrome.devtools.inspectedWindow.tabId
            })
    }
    else {
        $('#div-col-none-' + ind).removeClass("staticHighlight");
        $('#div-col-' + ind).removeClass("staticHighlight");
        chrome.runtime.sendMessage(
            {
                name: requestName.addMouseMoveKeyPressEvent,
                scriptToExecute: "DevPanel/js/elLocation/mouseMoveKeyPressEvents_Release.js",
                tabId: chrome.devtools.inspectedWindow.tabId
            })
    }
}

//Page Object`s tabs
function addPageObjectPreviewTab(javaCode, tabName) {

    var index = $('.tab-link').children().length;

    var template = $("#template_tab").html().replace(/{i}/g, index);
    $('.tab-link').append(template);

    template = $("#template_tab_content").html().replace(/{i}/g, index);
    $('.content-area').append(template);

    $('#code-' + index).text(javaCode);
    $('#code-' + index).each(function (i, block) {
        hljs.highlightBlock(block);
    });

    if (tabName !== undefined)
        $('#a-' + index).text(tabName)

    $($('.tab-link').children()[0]).addClass('active');
    $($('.content-area').children()[0]).addClass('active');

    $('.tab-panel .tab-link a').on('click', function (e) {
        var currentAttrValue = $(this).attr('href');

        $('.tab-panel ' + currentAttrValue).slideDown(0).siblings().slideUp(0);

        $(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });
}

function rebuildPageObjectPreviewTab(){
    tree_json = undefined;
    tree_json = getJSONFromTree("tree", tree_json);

    $('.tab-link').empty();
    $('.content-area').empty();

    $.each(translateToJava2(tree_json), function (ind, val) {
        addPageObjectPreviewTab(val.data, val.name)
    })
}

//getting jdi from tree
function getBeanAsJDIObject(beanID) {
    var ind = beanID.split("-").pop();

    return jdiObject(
        $('#PO-name-' + ind).val(),
        $('#PO-type-' + ind).val(),
        $('#PO-gen-' + ind).val(),
        undefined,
        $('#PO-locator-' + ind).val());
}

function getJSONFromTree(parentID, json) {

    if (json === undefined)
        json = [];

    $.each($('#' + parentID).children('ul').children('li'), function (ind, val) {
        id = val.getAttribute("id");
        json.push(getBeanAsJDIObject(id))
        if ($(val).children('ul').length !== 0)
            json[ind].elements = getJSONFromTree(id, json[ind].elements)
    });

    if (parentID === 'tree')
        return {
            name: $('#txt-name').val(),
            title: $('#txt-title').val(),
            type: $('#txt-type').val(),
            url: $('#txt-URL').val(),
            elements: json
        };

    return json;
}

//Page info
function populatePageInfo(jsonElements) {
    $('#txt-name').val(jsonElements.name);
    $('#txt-title').val(jsonElements.title);
    $('#txt-type').val(jsonElements.type);
    $('#txt-URL').val(jsonElements.url);
}

