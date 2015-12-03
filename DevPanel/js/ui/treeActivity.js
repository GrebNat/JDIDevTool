//draw JDI Tree
function drawJDITree(jsonElements, parentID) {
    $.each(jsonElements.elements, function (ind, el) {
        if (el.elements === undefined)
            addNewJDIBeanToTree(parentID, el);
        else {
            var drawnEl = addNewJDIBeanToTree(parentID, el);
            var ind = drawnEl.getAttribute("id").split("-").pop();
            drawJDITree(el, '#main-div-{0}'.format(ind));
        }
    });
}

//JDI Bean
function fillJDIBean(index, jdiObj) {

    $('#jdi-name-{0}'.format(index)).text(jdiObj === undefined ? "no jdi-name" : jdiObj.name);
    $('#jdi-type-{0}'.format(index)).text(jdiObj === undefined ? "no jdi-type" : jdiObj.type);

    $('#PO-type-{0}'.format(index)).val(jdiObj === undefined ? "no type" : jdiObj.type);

    if (jdiObj === undefined) {
        $('#PO-name-{0}'.format(index)).val("no name").addClass("warningText");
        $('#jdi-name-col-{0}'.format(index)).text("no name").addClass("warningText");
    } else {

        $('#PO-gen-{0}'.format(index)).val(jdiObj.gen === undefined ? "" : jdiObj.gen);

        if (jdiObj.name === "" | jdiObj.name === null | jdiObj.name === undefined) {
            $('#PO-name-' + index).val("no name").addClass("warningText");
            $('#jdi-name-col-' + index).text("no name").addClass("warningText");
        } else {
            $('#PO-name-{0}'.format(index)).val(jdiObj.name).removeClass("warningText");
            $('#jdi-name-col-{0}'.format(index)).text(jdiObj.name).removeClass("warningText");
        }

        if (jdiObj.locator === "" | jdiObj.locator === null | jdiObj.locator === undefined) {
            $('#PO-locator-{0}'.format(index)).val("no locator").addClass("warningText");
        } else {
            $('#PO-locator-{0}'.format(index)).val(jdiObj.locator).removeClass("warningText");
            addEventToBeanLocator(index);
        }
    }
}

function addNewJDIBeanToTree(parentCSS, jdiElement) {

    var template = $("#template").html().replace(/{i}/g, treeElementCount);

    if ($(parentCSS).children('ul').length === 0)
        $(parentCSS).append("<ul>" + template + "</ul>")
    else
        $(parentCSS).children('ul').append(template)

    addJDIBeanEvents(treeElementCount);
    makeJDIBeanDraggableDroppable(treeElementCount);
    fillJDIBean(treeElementCount, jdiElement)

    treeElementCount++;

    return $(template)[0];
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

function clearSelectionToDrop() {

    while ($("[id^=div-col-]").hasClass("selectedToDrop"))
        $("[id^=div-col-]").removeClass("selectedToDrop");
}

function addEventToBeansCheckBox(ind) {

    if ($('#cb-locate-' + ind).is(':checked')) {

        $.each($('[id^=tree]  .staticHighlight'), function (i, val) {
            $(this).removeClass("staticHighlight");
        });
        $.each($('[id^=tree] input[id^=cb-locate]'), function (i, val) {
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
    } else {
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

//JDI-Bean Events
function addJDIBeanEvents(index) {

    $('#btn-col-{0}'.format(index)).on('click', function () {

        var ind = this.getAttribute("id").split("-").pop();

        if ($(this).hasClass('glyphicon-expand')) {
            $(this).removeClass('glyphicon-expand');
            $(this).addClass('glyphicon-collapse-down');
            $("#div-col-{0}".format(ind)).css("display", "block");
            $("#div-col-none-{0}".format(ind)).css("display", "none");
        } else {
            $(this).removeClass('glyphicon-collapse-down');
            $(this).addClass('glyphicon-expand');
            $("#div-col-{0}".format(ind)).css("display", "none");
            $("#div-col-none-{0}".format(ind)).css("display", "block");
        }
    });

    $('#PO-name-{0}'.format(index)).on('input', function () {

        var ind = this.getAttribute("id").split("-").pop();

        var txt = $('#PO-name-' + ind).val();

        $('#PO-name-' + ind).removeClass("warningText");
        $('#jdi-name-col-' + ind).removeClass("warningText")
        $('#jdi-name-col-' + ind).text(txt);

        var pageIndex = $('#jdi-name-col-' + ind).parents("[id^='page-']").attr('id').split("-").pop();

        rebuildPageObjectPreviewTab(pageIndex);
    });

    $('#modal-btn-delete-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        $('#modal-' + ind).modal("hide");
        $('#main-div-' + ind).remove();
    })

    $('#modal-btn-up-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        $('#modal-' + ind).modal("hide");

        var elements = $('#main-div-' + ind).children('ul').children();

        $.each(elements, function (index, val) {
            $(val).insertBefore('#main-div-' + ind);
        })

        $('#main-div-' + ind).remove();
    })

    $('#btn-remove-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        if ($('#main-div-' + ind).children('ul').children().length > 0)
            $("#modal-" + ind).modal("show");
        else
            $('#main-div-' + ind).remove();
    })

    $('#btn-add-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        addNewJDIBeanToTree('#main-div-{0}'.format(ind));
    })

    $('#div-col-{0}'.format(index)).on("mouseover", function () {
        $(this).addClass("highlight");
    });
    $('#div-col-{0}'.format(index)).on("mouseout", function () {
        $(this).removeClass("highlight");
    })
    $('#div-col-none-{0}'.format(index)).on("mouseover", function () {
        $(this).addClass("highlight");
    });
    $('#div-col-none-{0}'.format(index)).on("mouseout", function () {
        $(this).removeClass("highlight");
    });

    $('#cb-locate-{0}'.format(index)).on('change', function () {
        addEventToBeansCheckBox(this.getAttribute("id").split("-").pop());
    })

    $('#PO-locator-{0}'.format(index)).on('input', function () {
        addEventToBeanLocator(this.getAttribute("id").split("-").pop())
    });
}

function addJDIBeanEditEvent_DataEdit(index) {
    addNewBeanEvent_DataEdit(index);
    deleteBeanEvent_DataEdit(index);
    editBeanTxtFieldEvent_DataEdit(index);
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

function getJSONFromTree(parentID, json, pageIndex) {

    if (json === undefined)
        json = [];

    $.each($('#' + parentID).children('ul').children('li'), function (ind, val) {
        id = val.getAttribute("id");
        json.push(getBeanAsJDIObject(id))
        if ($(val).children('ul').length !== 0)
            json[ind].elements = getJSONFromTree(id, json[ind].elements, pageIndex)
    });

    if (parentID === 'tree-{0}'.format(pageIndex))
        return {
            name: $('#txt-name-{0}'.format(pageIndex)).val(),
            title: $('#txt-title-{0}'.format(pageIndex)).val(),
            type: $('#txt-type-{0}'.format(pageIndex)).val(),
            url: $('#txt-URL-{0}'.format(pageIndex)).val(),
            packageName: $('#txt-package-{0}'.format(pageIndex)).val(),
            elements: json
        };

    return json;
}