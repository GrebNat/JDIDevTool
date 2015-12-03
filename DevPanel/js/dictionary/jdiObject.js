function jdiObject(_name, _type, _gen, _elements, _locator) {
    return {
        name: _name,
        type: _type,
        gen: _gen,
        elements: _elements,
        locator: _locator
    };
}

var jdiTags = {
    jdi_type: "jdi-type",
    jdi_name: "jdi-name",
    jdi_parent: "jdi-parent",
    jdi_gen: "jdi-gen"
}

function pageURLRelation(page_id, url) {
    return {
        PageId: page_id,
        url: url
    }
}

var sectionTypes = new Array('Form', 'IPagination');
