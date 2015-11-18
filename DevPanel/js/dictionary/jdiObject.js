function jdiObject(_name, _type, _parent, _gen, _elements)
{
    return {
        name:   _name,
        type:   _type,
        parent: _parent,
        gen: _gen,
        elements: _elements,
        poName: _name,
        poType: _type
    };
}

var jdiTags = {
    jdi_type: "jdi-type",
    jdi_name: "jdi-name",
    jdi_parent: "jdi-parent",
    jdi_get: "jdi-gen"
}