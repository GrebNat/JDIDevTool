function jdiObject(_name, _type, _parent)
{
    return {
        name:   _name,
        type:   _type,
        parent: _parent,

        asString: "name: "+_name+"; type: "+_type+"; pasrent: "+_parent
    };
}