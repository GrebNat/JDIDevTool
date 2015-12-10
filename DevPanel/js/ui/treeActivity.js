//draw JDI Tree
function drawJDITree(jsonElements, parentID) {
    if (jsonElements !== undefined)
        if (jsonElements.elements !== undefined)
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

    $('#PO-type-{0}'.format(index)).val(jdiObj === undefined ? "no type" : jdiObj.type);

    fillPOTypeDropDown($("#PO-type-{0}".format(index)).parent(), index);

    if (jdiObj === undefined) {
        $('#PO-name-{0}'.format(index)).val("no name").addClass("warningText");
        $('#jdi-name-col-{0}'.format(index)).text("no name").addClass("warningText");
    } else {

        if (sectionTypes.indexOf(jdiObj.type) !== -1) {
            $('#PO-gen-{0}'.format(index)).val(jdiObj.gen === undefined ? "" : jdiObj.gen);
            $('#PO-section-{0}'.format(index)).val(jdiObj.section === undefined ? "" : jdiObj.section);

            $('#tr-PO-section-{0}, #tr-PO-gen-{0}'.format(index)).css("display", "table-row");
        }

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

function editPageData(index, jdiObj) {

    var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));

    pages.updateBeanData(getCurrentPageId(), elPath, jdiObj);
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

    addJDIBeanEditEvent_DataEdit(treeElementCount);

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

        $('#div-col-none-{0}, #div-col-{0}'.format(ind)).addClass("staticHighlight");
    } else {
        $('#div-col-none-{0}, #div-col-{0}'.format(ind)).removeClass("staticHighlight");

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

    $('#modal-btn-delete-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        var pageId = getCurrentPageId();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(ind));

        pages.removeBean(pageId, elPath);

        $('#modal-' + ind).modal("hide");
        $('#main-div-' + ind).remove();

        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    })

    $('#modal-btn-up-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        $('#modal-' + ind).modal("hide");

        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(ind));
        var pageId = getCurrentPageId();

        pages.upChildren(pageId, elPath);

        var elements = $('#main-div-' + ind).children('ul').children();

        $.each(elements, function (index, val) {
            $(val).insertBefore('#main-div-' + ind);
        })

        $('#main-div-' + ind).remove();

        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    })

    $('#btn-remove-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();

        if ($('#main-div-' + ind).children('ul').children().length > 0)
            $("#modal-" + ind).modal("show");
        else {
            var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(ind));
            var pageId = getCurrentPageId();

            pages.removeBean(pageId, elPath);
            $('#main-div-' + ind).remove();

            fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
        }


    })

    $('#btn-add-{0}'.format(index)).on('click', function () {
        var ind = this.getAttribute("id").split("-").pop();
        addNewJDIBeanToTree('#main-div-{0}'.format(ind));
    })

    $('#div-col-{0}, #div-col-none-{0}'.format(index)).on("mouseover", function () {
        $(this).addClass("highlight");
    });
    $('#div-col-{0}, #div-col-none-{0}'.format(index)).on("mouseout", function () {
        $(this).removeClass("highlight");
    })

    $('#cb-locate-{0}'.format(index)).on('change', function () {
        addEventToBeansCheckBox(this.getAttribute("id").split("-").pop());
    })
}

function addJDIBeanEditEvent_DataEdit(index) {
    addNewBeanEvent_DataEdit(index);
    editBeanTxtFieldEvent_DataEdit(index);
}

function addNewBeanEvent_DataEdit(index) {
    $('#btn-add-{0}'.format(index)).on('click', function () {
        var indexParent = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(indexParent));
        var pageId = getCurrentPageId();
        var beanID = $("#main-div-{0} > ul > li:nth-last-child(1)".format(indexParent)).attr('id');

        pages.addBean(pageId, elPath, getBeanAsJDIObject(beanID));

        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    })
}
function editBeanTxtFieldEvent_DataEdit(index) {

    $('#PO-locator-{0}'.format(index)).on('input', function () {
        var index = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
        var pageId = getCurrentPageId();

        pages.updateBeanData(pageId, elPath, {locator: $(this).val()});
        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    });
    $('#PO-name-{0}'.format(index)).on('input', function () {
        var index = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
        var pageId = getCurrentPageId();

        $(this).removeClass("warningText");
        $('#jdi-name-col-{0}'.format(index)).text($(this).val()).removeClass("warningText");

        pages.updateBeanData(pageId, elPath, {name: $(this).val()});
        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    });
    $('#PO-type-{0}'.format(index)).on('input', function () {
        var index = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
        var pageId = getCurrentPageId();

        pages.updateBeanData(pageId, elPath, {type: $(this).val()});
        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    });
    $('#PO-gen-{0}'.format(index)).on('input', function () {
        var index = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
        var pageId = getCurrentPageId();

        pages.updateBeanData(pageId, elPath, {gen: $(this).val()});
        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    });
    $('#PO-section-{0}'.format(index)).on('input', function () {
        var index = $(this).attr('id').split("-").pop();
        var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
        var pageId = getCurrentPageId();

        pages.updateBeanData(pageId, elPath, {section: $(this).val()});
        fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);
    });
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

//populate

function fillPOTypeDropDown(dropDown, index) {
    var ul = $(dropDown).find('ul');

    ul.empty();

    ul.append('<li class="dropdown-header">Sections</li>');
    for (var i = 0, len = sectionTypes.length; i < len; i++) {
        var a = '<li><a id="a-PO-section-type-{0}-{1}">{2}</a></li>'.format(index, i, sectionTypes[i]);

        ul.append(a)

        $('#a-PO-section-type-{0}-{1}'.format(index, i)).on('click', function () {

            var i = $(this).attr('id').split('-').pop()

            $(this).parents('.dropdown').find('input').val(sectionTypes[i])

            var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
            var pageId = getCurrentPageId();

            pages.updateBeanData(pageId, elPath, {type: $(this).text()});
            fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);

            $('#tr-PO-section-{0}, #tr-PO-gen-{0}'.format(index)).css("display", "table-row");
        })
    }

    ul.append('<li class="divider"></li>');
    ul.append('<li class="dropdown-header">Elements</li>');
    for (var i = 0, len = elementTypes.length; i < len; i++) {
        var a = '<li><a id="a-PO-elements-type-{0}-{1}">{2}</a></li>'.format(index, i, elementTypes[i]);

        ul.append(a)

        $('#a-PO-elements-type-{0}-{1}'.format(index, i)).on('click', function () {

            var i = $(this).attr('id').split('-').pop()

            $(this).parents('.dropdown').find('input').val(elementTypes[i]);

            var elPath = getBeanIndexSequenceOnPage("main-div-{0}".format(index));
            var pageId = getCurrentPageId();

            pages.updateBeanData(pageId, elPath, {type: $(this).text()});
            fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements, pageId);

            $('#tr-PO-section-{0}, #tr-PO-gen-{0}'.format(index)).css("display", "none");
        })
    }
}
