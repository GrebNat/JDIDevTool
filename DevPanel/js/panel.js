var treeElementCount = 0;
var jdi_page_json = undefined;
var tree_json = [];
var done = false;
var draggingStarted = false;
var pageObjectsFiles = [];
var sections = new Sections();
var pages = new Pages();

document.addEventListener('DOMContentLoaded', function (e) {

    var template = $("#template-page").html().replace(/{page}/g, 0);
    $('#page-0').append(template);
    (new PageBuilder("page-0")).buildPageContent();

    $('#add-new-tag').on('click', function (e) {
        addNewTabLinkEvent();
    })

    navigateToWebPageEvent("#a-page-0")

    chrome.storage.onChanged.addListener(function (changed, e1) {
        if ('jdi_page' in changed) {
            if (changed.jdi_page.newValue.tabId === chrome.devtools.inspectedWindow.tabId) {

                jdi_page_json = changed.jdi_page.newValue.data;
                json = $.parseJSON(jdi_page_json);
                pageObjectsFiles = translateToJava(json)

                //  var pageId = getItemByFieldContent(pagesUrlsRel, "url", json.url).PageId;

                var pageId = pages.getPageByURL(json.url).id;
                var pageIndex = pageId.split("-").pop();

                pages.updatePageData(page("page-{0}".format(pageIndex),
                        json.url,
                        json));
                pages.addSectionObjects("page-{0}".format(pageIndex), sections);

                drawJDITree(json, "#tree-{0}".format(pageIndex));
                populatePageInfo(json, pageId);

                $.each(pageObjectsFiles.getCombElements(),
                        function (ind, val) {
                            addPageObjectPreviewTab(val, 0, pageId);
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
});

function addNewTabLinkEvent() {
    var pageIndex = $('#main-nav-tabs [id^=a-page-]').length;

    $.each($('#main-tab-content > div'), function (ind, val) {
        $(val).removeClass("in active");
    })

    $('#main-tab-content').append('<div id="page-{0}" class="tab-pane fade in active"></div>'.format(pageIndex));

    $('#main-tab-content')

    $('#add-new-tag')
            .attr('id', "a-page-{0}".format(pageIndex))
            .attr('href', "#page-{0}".format(pageIndex))
            .empty()
            .text('New Tab')
            .off('click');

    navigateToWebPageEvent("#a-page-{0}".format(pageIndex));

    $('#main-nav-tabs').append('<li><a id="add-new-tag"><span class="glyphicon glyphicon-plus"></span></a></li>');

    $('#page-{0}'.format(pageIndex)).append($("#template-page").html().replace(/{page}/g, pageIndex));

    new PageBuilder('page-{0}'.format(pageIndex)).buildPageContent();

    $('#add-new-tag').on('click', function (e) {
        addNewTabLinkEvent();
    })

    scroll(0, 0);
    $("html, body").animate({scrollTop: 0});
}
function navigateToWebPageEvent(a) {
    $(a).click(function (e) {
        $(this).tab('show');

        var url = $($(e.target).attr('href')).find("[id^='txt-URL-']").val();

        chrome.devtools.inspectedWindow.eval(
                "window.location.href='{0}'".format(url),
                function (result, isException) {
                    console.log(result);
                });

        scroll(0, 0);
        $("html, body").animate({scrollTop: 0});
    })
}

