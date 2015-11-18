chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request){
            case requestName.getPageJSONByJDIElements:{
                sendResponse(getPageAsJsonByJDI());}
                break;
            default:
                alert("wrong responce");
        }
});

function getPageAsJsonByJDI() {

    var page = {
        name: location.pathname,
        url: document.URL,
        title: document.title,
        type: "IPage",
        elements: formatAllJDIElementsArray(getWebElementsWithJDIType())
    };

    return JSON.stringify(page);
}

function getWebElementsWithJDIType() {
    return Array.prototype.slice.call(document.querySelectorAll("[" + jdiTags.jdi_type + "]"));
}

function formatAllJDIElementsArray(elements) {
    var result = [], children = [];

    $.each(elements, function (index, value) {
        result.push(
            jdiObject(
                value.getAttribute(jdiTags.jdi_name),
                value.getAttribute(jdiTags.jdi_type),
                (value.hasAttribute(jdiTags.jdi_parent)) ? value.getAttribute(jdiTags.jdi_parent) : undefined,
                (value.hasAttribute(jdiTags.jdi_get)) ? value.getAttribute(jdiTags.jdi_get) : undefined,
                []));
    });

    children = separateJDIChildrenParent(result);
    groupJDIElements(result, children);

    return result;
}

function groupJDIElements(parent, children) {
    for (var i = 0; i < children.length; i++) {
        for (var j = 0; j < parent.length; j++) {
            if (parent[j].elements !== undefined)
                if (parent[j].elements.length > 0) {
                    groupJDIElements(parent[j].elements, children);
                }
            j = (parent[j] === undefined) ? 0 : j;
            i = (children[i] === undefined) ? 0 : i;
            if (parent[j].name === children[i].parent) {
                parent[j].elements.push(children.splice(i, 1)[0]);
                i = j = -1;
                break;
            }
        }
    }
}

function separateJDIChildrenParent(arr) {
    var res = [];
    for (var n = 0; n < arr.length;) {
        if (arr[n].parent !== undefined) res.push(arr.splice(n, 1)[0]);
        else n++;
    }
    return res;
}

