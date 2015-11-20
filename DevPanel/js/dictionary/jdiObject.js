var jdiObject = function (_name, _type, _parent, _gen, _elements, _locator) {
    this.name = _name;
    this.type = _type;
    this.parent = _parent;
    this.gen = _gen;
    this.elements = _elements;
    this.locator = _locator;
}

var jdiTags = {
    jdi_type: "jdi-type",
    jdi_name: "jdi-name",
    jdi_parent: "jdi-parent",
    jdi_get: "jdi-gen"
}