var treeElementCount = 0;
var jdi_page_json = undefined;
var tree_json = [];
var done = false;
var draggingStarted = false;
var pageObjectsFiles = [];

document.addEventListener('DOMContentLoaded', function (e) {

    chrome.storage.local.clear();

    $('#btn-all').on('click', function () {
        cleanAll();
        chrome.storage.local.clear();
        chrome.runtime.sendMessage({
            name: requestName.savePageJSONByJDIElementsToStorage,
            tabId: chrome.devtools.inspectedWindow.tabId
        });
    })

    $('#btn-new-json').on('click', function () {
        clearTabs();
        rebuildPageObjectPreviewTab();
    })

    $('#btn-empty-tree').on('click', function () {
        cleanAll();
    })

    $('#btn-download-all').on('click', function(){
        (new saveFile).asZip(pageObjectsFiles, "PageObjects");
    })

    $('#load-new-page').on('click', function(){
        chrome.devtools.inspectedWindow.eval(
            "window.location.href='http://localhost:8090/page6.htm'",
            function(result, isException) {
                console.log(result);
            });
    })

    chrome.storage.onChanged.addListener(function (changed, e1) {
        if ('jdi_page' in changed) {
            if (changed.jdi_page.newValue.tabId == chrome.devtools.inspectedWindow.tabId) {
                pageObjectsFiles = [];
                jdi_page_json = changed.jdi_page.newValue.data;
                pageObjectsFiles=translateToJava($.parseJSON(jdi_page_json))

                drawJDITree($.parseJSON(jdi_page_json), "tree");
                populatePageInfo($.parseJSON(jdi_page_json));

                $.each(pageObjectsFiles.getCombElements(),
                    function (ind, val) {
                        addPageObjectPreviewTab(val, 0);
                    });

                jdi_page_json = undefined;
                chrome.storage.local.remove('jdi_page');
            }
        }
        if ('jdi_object' in changed) {
            if (changed.jdi_object.newValue.tabId == chrome.devtools.inspectedWindow.tabId) {
                ind = $(".staticHighlight [id^='PO-name-']")[0].getAttribute("id").split("-").pop();

                fillJDIBean(ind, changed.jdi_object.newValue.data);
            }
        }
    });

    addPONavBarEvents();
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

//JDI Bean
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
            addEventToBeanLocator(index);
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
    makeJDIBeanDraggableDroppable(treeElementCount);
    fillJDIBean(treeElementCount, jdiElement)

    treeElementCount++;

    return $(template)[0];
}

function addJDIBeanEvents(index) {

    $('#btn-col-' + index).on('click', function () {

        var ind = this.getAttribute("id").split("-").pop();

        if ($(this).hasClass('glyphicon-expand')) {
            $(this).removeClass('glyphicon-expand');
            $(this).addClass('glyphicon-collapse-down');
            $("#div-col-" + ind).css("display", "block");
            $("#div-col-none-" + ind).css("display", "none");
        }
        else {
            $(this).removeClass('glyphicon-collapse-down');
            $(this).addClass('glyphicon-expand');
            $("#div-col-" + ind).css("display", "none");
            $("#div-col-none-" + ind).css("display", "block");
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

    $('#modal-btn-delete-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        $('#modal-' + ind).modal("hide");
        $('#main-div-' + ind).remove();
    })

    $('#modal-btn-up-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        $('#modal-' + ind).modal("hide");

        var elements = $('#main-div-' + ind).children('ul').children();

        $.each(elements, function (index, val) {
            $(val).insertBefore('#main-div-' + ind);
        })

        $('#main-div-' + ind).remove();
    })

    $('#btn-remove-' + index).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        if ($('#main-div-' + ind).children('ul').children().length > 0)
            $("#modal-" + ind).modal("show");
        else
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
        addEventToBeansCheckBox(this.getAttribute("id").split("-").pop());
    })

    $('#PO-locator-' + index).on('input', function () {
        addEventToBeanLocator(this.getAttribute("id").split("-").pop())
    });
}

function makeJDIBeanDraggableDroppable(index) {

    $('#main-div-' + index).draggable({
            stop: function (event, index) {
                if (draggingStarted) {
                    $('#tree > ul').append(event.target);
                    $(event.target).css({left: 0, top: "auto"});
                }
                draggingStarted = false;
            },
            start: function (event, index) {
                draggingStarted = true;
            }
        }
    );
    $('#main-div-' + index).droppable({
        drop: function (event, ui) {

            clearSelectionToDrop()

            if ($(event.target).children('ul').length === 0)
                $(event.target).append("<ul></ul>");

            $($(event.target).children('ul')[0]).append(ui.draggable);
            $(ui.draggable).css({left: "auto", top: "auto"});

            draggingStarted = false;
        },
        over: function (event) {

            ind = $(event.target).attr("id").split("-").pop();

            $(event.target).find('#div-col-none-' + ind).addClass("selectedToDrop");
            $(event.target).find('#div-col-' + ind).addClass("selectedToDrop");
        },
        out: function (event) {

            ind = $(event.target).attr("id").split("-").pop();

            clearSelectionToDrop()
        }
    });
}

function clearSelectionToDrop(){

    while ($("[id^=div-col-]").hasClass("selectedToDrop"))
        $("[id^=div-col-]").removeClass("selectedToDrop");
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

        chrome.runtime.sendMessage({
            name: requestName.releaseMouseMoveKeyPressEvent,
            tabId: chrome.devtools.inspectedWindow.tabId
        })
        chrome.runtime.sendMessage({
            name: requestName.restoreAllElementBackgroundColorOnWeb,
            tabId: chrome.devtools.inspectedWindow.tabId
        })

        chrome.runtime.sendMessage({
            name: requestName.highlightElementOnWeb,
            tabId: chrome.devtools.inspectedWindow.tabId,
            cssLocator: $("#PO-locator-" + ind).val()
        })
        chrome.runtime.sendMessage({
            name: requestName.addMouseMoveKeyPressEvent,
            tabId: chrome.devtools.inspectedWindow.tabId
        })

        $('#div-col-none-' + ind).addClass("staticHighlight");
        $('#div-col-' + ind).addClass("staticHighlight");
    }
    else {
        $('#div-col-none-' + ind).removeClass("staticHighlight");
        $('#div-col-' + ind).removeClass("staticHighlight");

        chrome.runtime.sendMessage({
            name: requestName.releaseMouseMoveKeyPressEvent,
            tabId: chrome.devtools.inspectedWindow.tabId
        })
        chrome.runtime.sendMessage({
            name: requestName.restoreAllElementBackgroundColorOnWeb,
            tabId: chrome.devtools.inspectedWindow.tabId
        })

    }
}

function addEventToBeanLocator(ind) {
    if ($('#cb-locate-' + ind).is(':checked')) {
        chrome.runtime.sendMessage({
            name: requestName.highlightElementOnWeb,
            tabId: chrome.devtools.inspectedWindow.tabId,
            cssLocator: $("#PO-locator-" + ind).val()
        })
    }
}

//Page Object`s tabs
function addPageObjectPreviewTab(data, activeTabIndex) {

    if (data.type === "IPage") {
        $('#a-page').text(data.name);
        $('#pre-page-PO').text(data.data);
        $('#pre-page-PO').each(function (i, block) {
            hljs.highlightBlock(block);
        });
        $('#btn-download-page').on('click', function(e){
            (new saveFile).asJava(
                [$('#pre-page-PO').text()],
                $('#a-page').text());
        })
    }
    else if (data.type === "Form") {
        var index = $('#form-tabs-header').children().length;

        var template = $("#template-form-tab").html().replace(/{i}/g, index);
        $('#form-tabs-header').append(template);
        $('#a-form-' + index).text(data.name);

        template = $("#template-form-content").html().replace(/{i}/g, index);
        $('#div-tab-content').append(template);

        collapsePanelEvent(1, index, data);
        collapsePanelEvent(2, index, data.elements[0][0]);
    }

    $('#form-content-' + activeTabIndex).addClass('in active');
    addPONavBarEvents();
}

function collapsePanelEvent(panelInd, ind, data){
    $('#a-collapse{0}-{1}'.format(panelInd, ind)).text(data.name);
    $('#collapse{0}-{1} pre'.format(panelInd, ind)).text(data.data);
    $('#collapse{0}-{1} pre'.format(panelInd, ind)).each(function (i, block) {
        hljs.highlightBlock(block);
    });

    $('#btn-collapse{0}-{1}'.format(panelInd, ind)).on("click", function(e){
        var ind = this.getAttribute("id").split("-").pop();

        (new saveFile).asJava(
            [$('#collapse{0}-{1} pre'.format(panelInd, ind)).text()],
            $('#a-collapse{0}-{1}'.format(panelInd, ind)).text());
    })
}

function addPONavBarEvents() {
    $(".nav-tabs a").click(function () {
        $(this).tab('show');
    });
    $('.nav-tabs a').on('shown.bs.tab', function (event) {
        var x = $(event.target).text();
        var y = $(event.relatedTarget).text();
        $(".act span").text(x);
        $(".prev span").text(y);
    });
}

function rebuildPageObjectPreviewTab() {
    tree_json = undefined;
    pageObjectsFiles = [];

    tree_json = getJSONFromTree("tree", tree_json);
    pageObjectsFiles = translateToJava(tree_json);

    clearTabs();

    $.each(pageObjectsFiles.getCombElements(), function (ind, val) {
        addPageObjectPreviewTab(val, 0)
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
            packageName: $('#txt-package').val(),
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
    if (jsonElements.packageName !== undefined)
        $('#txt-package').val(jsonElements.packageName);
}

//clear functions
function cleanAll() {
    $('#tree').empty();

    clearTabs();
    clearPageInfo();
}

function clearTabs() {
    $('#form-tabs-header').empty();
    $('#div-tab-content').empty();
    $('#pre-page-PO').text("")
    $('#a-page').text("Page");
}

function clearPageInfo(){
    $('#txt-name').val("");
    $('#txt-title').val("");
    $('#txt-type').val("");
    $('#txt-URL').val("");
    $('#txt-package').val("");
}

