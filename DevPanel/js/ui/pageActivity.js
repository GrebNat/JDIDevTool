function PageBuilder(pageId) {

    this.pageId = pageId;
    this.pageIndex = pageId.split("-").pop()

    this.buildPageContent = function () {
        chrome.storage.local.clear();

        $('#btn-all-{0}'.format(this.pageIndex)).on('click', function (e) {

            chrome.devtools.inspectedWindow.eval(
                "window.location.href",
                function (url) {
                    var pageId = getCurrentPageId();
                    if (pages.getPageIndexByURLandID(url, pageId) !== -1) {
                        cleanAll(pageId);
                    } else if (pages.getPageByURL(url) !== undefined) {
                        var newPageId = pages.getPageByURL(url).id;
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
        $('#btn-empty-tree-{0}'.format(this.pageIndex)).on('click', function (e) {
            cleanAll($(e.target).parents("[id^=page-]")[0].id);
        })
        $('#btn-download-all-{0}'.format(this.pageIndex)).on('click', function (e) {
            var pageData = [], sectionData = [];

            for (var i in pages.pagesArray) {
                var data = translateToJava(pages.pagesArray[i].data);
                for (var j in data)
                    if (data[j].type === 'IPage')
                        pageData.push({
                            data: data[j].data,
                            name: 'pages/' + data[j].name
                        })
            }

            for (var i in sections.sectionsArray) {
                var data = translateToJava(sections.sectionsArray[i]);
                for (var j= 0;j < data.length; j++)
                    sectionData.push({
                        data: data[j].data,
                        name: 'sections/' + data[j].name
                    })
            }

            (new saveFile).asJavaZip($.merge(pageData, sectionData), "PageObjects");
        })
        $('#span-add-new-bean-{0}'.format(this.pageIndex)).on('click', function (e) {
            var pageIndex = $(this).attr("id").split("-").pop();
            var pageId = getCurrentPageId();

            var beanID = $(addNewJDIBeanToTree('#tree-{0}'.format(pageIndex))).attr('id');

            pages.addBean(pageId, [], getBeanAsJDIObject(beanID));
            fillPageObjectPre(translateToJava(pages.getPageByID(pageId).data).getCombElements(), pageId);
        })

        addNavBarEvents();
        pages.addNewPage(page(pageId));
        fillPage(this.pageId);
    }
}

function fillPage(pageId) {
    $("#a-" + pageId).click(function () {
        $(this).tab('show');

        var pageId = $(this).attr('href').substring(1);
        var pageIndex = pageId.split('-').pop();
        var pageObject = pages.getPageByID(pageId).data;

        cleanAll(pageId);

        drawJDITree(pageObject, "#tree-{0}".format(pageIndex));
        fillPageObjectPre(translateToJava(pageObject).getCombElements(), pageId);
        fillPageInfo(pageObject, pageId);

        scroll(0, 0);
    });
}

//Page Object`s tabs
function fillPageObjectPre(data, pageId) {

    for (var i = 0; i < data.length; i++) {
        var pageIndex = pageId.split("-").pop();

        if (data[i].type === "IPage") {

            renameTab(data[i].name,'a-page-{0}'.format(pageIndex));

            $('#PO-pre-{0}'.format(pageIndex))
                .text(data[i].data)
                .each(function (i, block) {
                    hljs.highlightBlock(block);
                });

            $('#btn-download-page-{0}'.format(pageIndex)).off('click').on('click', function (e) {
                var pageIndex = this.getAttribute("id").split("-").pop();

                (new saveFile).asJava(
                    [$('#PO-pre-{0}'.format(pageIndex)).text()],
                    $('#a-page-{0}'.format(pageIndex)).text());
            })
        }
    }
}

function addNavBarEvents() {
    $(".nav-tabs a").click(function () {
        $(this).tab('show');
        scroll(0, 0);
        //  $("html, body").animate({scrollTop: 0});
    });
}

//Page info
function fillPageInfo(jsonElements, pageId) {

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

function getBeanIndexSequenceOnPage(beanId) {
    var sequence = [];

    var bean = beanId;

    sequence.push($('#' + beanId).index());

    while ($("#" + bean).parent().parent().attr('class') !== 'treeDiv') {
        bean = $("#" + bean).parent().parent().attr('id');
        sequence.unshift($('#' + bean).index());
    }

    return sequence;
}

//clear functions
function cleanAll(pageId) {

    var pageIndex = pageId.split("-").pop();
    chrome.storage.local.remove('jdi_page');
    chrome.storage.local.clear();
    $('#tree-{0}'.format(pageIndex)).empty();
    clearPOPreview(pageIndex);
    clearPageInfo(pageIndex);
}

function clearPOPreview(pageIndex) {
    $('#btn-download-page-{0}'.format(pageIndex)).off('click');
    $('#PO-pre-{0}'.format(pageIndex)).text("");

    renameTab('Page','a-page-{0}'.format(pageIndex));
}

function clearPageInfo(pageIndex) {
    $('#txt-name-{0}'.format(pageIndex)).val("");
    $('#txt-title-{0}'.format(pageIndex)).val("");
    $('#txt-type-{0}'.format(pageIndex)).val("");
    $('#txt-URL-{0}'.format(pageIndex)).val("");
    $('#txt-package-{0}'.format(pageIndex)).val("");
}
