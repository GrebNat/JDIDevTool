/**
 * Created by Natalia_Grebenshchikova on 12/11/2015.
 */

function getBeanAsJDIObject(beanID) {
    var ind = beanID.split("-").pop();

    return jdiObject(
        $('#PO-name-' + ind).val(),
        $('#PO-type-' + ind).val(),
        $('#PO-gen-' + ind).val(),
        [],
        $('#PO-locator-' + ind).val());
}
function getJSONFromTree(parentID, json, pageIndex) {

    if (json === undefined) {
        json = [];
        json.push(getBeanAsJDIObject(parentID));
        json = json[0];
    }

    $.each($('#' + parentID).children('ul').children('li'), function (ind, val) {
        id = val.getAttribute("id");
        json.elements.push(getBeanAsJDIObject(id))
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