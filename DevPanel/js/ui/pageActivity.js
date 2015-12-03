function PageBuilder(pageId) {

    this.pageId = pageId;
    this.pageIndex = pageId.split("-").pop()

    this.buildPageContent = function () {
        chrome.storage.local.clear();

        $('#btn-all-{0}'.format(this.pageIndex)).on('click', function (e) {

            chrome.devtools.inspectedWindow.eval(
                    "window.location.href",
                    function (url) {
                        pageId = getCurrentPageId();
                        if (pages.getPageIndexByURLandID(url, pageId) !== -1) {
                            cleanAll(pageId);
                        } else if (pages.getPageByURL(url) !== undefined) {
                            newPageId = pages.getPageByURL(url).id;
                            cleanAll(newPageId);
                            $('#a-{0}'.format(newPageId)).tab('show');
                        } else if (pages.getPageByURL(url) === undefined) {
                            pages.getPageByID(pageId).url = url;
                        }

                        chrome.runtime.sendMessage({
                            name: requestName.savePageJSONByJDIElementsToStorage,
                            tabId: chrome.devtools.inspectedWindow.tabId
                        });
                    });
        });

        $('#btn-new-json-{0}'.format(this.pageIndex)).on('click', function (e) {

            var pageIndex = $(e.target).attr("id").split("-").pop()

            clearTabs(pageIndex);
            rebuildPageObjectPreviewTab(pageIndex);
        })

        $('#btn-empty-tree-{0}'.format(this.pageIndex)).on('click', function (e) {
            cleanAll($(e.target).parents("[id^=page-]")[0].id);
        })

        $('#btn-download-all-{0}'.format(this.pageIndex)).on('click', function (e) {
            (new saveFile).asZip(pageObjectsFiles, "PageObjects");
        })

        addPONavBarEvents();
        pages.addNewPage(page(pageId))
    };
}

//Page Object`s tabs
function addPageObjectPreviewTab(data, activeTabIndex, pageId) {

    var pageIndex = pageId.split("-").pop();
    if (data.type === "IPage") {
        $('#a-page-tab-{0}'.format(pageIndex)).text(data.name);
        $('#a-page-{0}'.format(pageIndex)).text(data.name);
        $('#pre-page-PO-{0}'.format(pageIndex)).text(data.data);
        $('#pre-page-PO-{0}'.format(pageIndex)).each(function (i, block) {
            hljs.highlightBlock(block);
        });
        $('#btn-download-page-{0}'.format(pageIndex)).on('click', function (e) {

            var ind = this.getAttribute("id").split("-").pop();
            (new saveFile).asJava(
                    [$('#pre-page-PO-{0}'.format(ind)).text()],
                    $('#a-page-{0}'.format(ind)).text());
        })
    } else if (data.type === "Form") {
        var tabIndex = $('#form-tabs-header-{0}'.format(pageIndex)).children().length;
        var template = $("#template-form-tab").html().replace(/{page}/g, pageIndex).replace(/{tab}/g, tabIndex);
        $('#form-tabs-header-{0}'.format(pageIndex)).append(template);
        $('#a-forms-{0}-{1}'.format(pageIndex, tabIndex)).text(data.name);
        template = $("#template-form-content").html().replace(/{page}/g, pageIndex).replace(/{tab}/g, tabIndex);
        $('#div-tab-content-{0}'.format(pageIndex)).append(template);
        collapsePanelEvent(1, pageIndex, tabIndex, data);
        collapsePanelEvent(2, pageIndex, tabIndex, data.elements[0][0]);
    }

    $('#form-content-{0}-{1}'.format(pageIndex, activeTabIndex)).addClass('in active');
    addPONavBarEvents();
}

function addPONavBarEvents() {
    $(".nav-tabs a").click(function () {
        $(this).tab('show');
        scroll(0, 0);
    });
}

function collapsePanelEvent(ind, pageId, tabInd, data) {
    $('#a-collapse{0}-{1}-{2}'.format(ind, pageId, tabInd)).text(data.name);
    $('#collapse{0}-{1}-{2} pre'.format(ind, pageId, tabInd)).text(data.data);
    $('#collapse{0}-{1}-{2} pre'.format(ind, pageId, tabInd)).each(function (i, block) {
        hljs.highlightBlock(block);
    });
    $('#btn-collapse{0}-{1}-{2}'.format(ind, pageId, tabInd)).on("click", function (e) {
        var ind = this.getAttribute("id").substring(12);
        (new saveFile).asJava(
                [$('#collapse{0} pre'.format(ind)).text()],
                $('#a-collapse{0}'.format(ind)).text());
    })
}

function rebuildPageObjectPreviewTab(pageIndex) {
    tree_json = undefined;
    pageObjectsFiles = [];
    tree_json = getJSONFromTree("tree-{0}".format(pageIndex), tree_json, pageIndex);
    pageObjectsFiles = translateToJava(tree_json);
    clearTabs(pageIndex);
    $.each(pageObjectsFiles.getCombElements(), function (ind, val) {
        addPageObjectPreviewTab(val, 0, pageIndex)
    })
}


//Page info
function populatePageInfo(jsonElements, pageId) {

    var pageIndex = pageId.split("-").pop();
    $('#txt-name-{0}'.format(pageIndex)).val(jsonElements.name);
    $('#txt-title-{0}'.format(pageIndex)).val(jsonElements.title);
    $('#txt-type-{0}'.format(pageIndex)).val(jsonElements.type);
    $('#txt-URL-{0}'.format(pageIndex)).val(jsonElements.url);
    if (jsonElements.packageName !== undefined)
        $('#txt-package-{0}'.format(pageIndex)).val(jsonElements.packageName);
}

function getCurrentPageId() {
    return $('#main-tab-content > .active').attr('id');
}

//clear functions
function cleanAll(pageId) {

    var pageIndex = pageId.split("-").pop();
    chrome.storage.local.remove('jdi_page');
    chrome.storage.local.clear();
    $('#tree-{0}'.format(pageIndex)).empty();
    clearTabs(pageIndex);
    clearPageInfo(pageIndex);
}

function clearTabs(pageIndex) {
    $('#form-tabs-header-{0}'.format(pageIndex)).empty();
    $('#div-tab-content-{0}'.format(pageIndex)).empty();
    $('#pre-page-PO-{0}'.format(pageIndex)).text("")
    $('#a-page-{0}'.format(pageIndex)).text("Page");
}

function clearPageInfo(pageIndex) {
    $('#txt-name-{0}'.format(pageIndex)).val("");
    $('#txt-title-{0}'.format(pageIndex)).val("");
    $('#txt-type-{0}'.format(pageIndex)).val("");
    $('#txt-URL-{0}'.format(pageIndex)).val("");
    $('#txt-package-{0}'.format(pageIndex)).val("");
}