var $actualBachgroundColore = "";
var $actualElementFromPoint = "";

$(document).on("mouseout", function (e) {
    if ($actualElementFromPoint !== "" && $actualElementFromPoint !== undefined)
        $actualElementFromPoint.style.backgroundColor = $actualBachgroundColore;
    $actualBachgroundColore = "";
    $actualElementFromPoint = "";
});

$(document).on("mouseover", function (e) {
    $actualElementFromPoint = e.target;
    $actualBachgroundColore = $actualElementFromPoint.style.backgroundColor;
    e.target.style.backgroundColor = "#93DBD5";
});

$(document).keypress(function (e) {

    console.log("key pressed");
    if (e.which === 115) {

        var jdi = new jdiObject(
            $actualElementFromPoint.getAttribute("jdi-name"),
            $actualElementFromPoint.getAttribute("jdi-type"),
            $actualElementFromPoint.getAttribute("jdi-parent"),undefined, undefined,
            "jdi-name="+$actualElementFromPoint.getAttribute("jdi-name"));

        chrome.runtime.sendMessage({
            name: requestName.jdiFromContentSaveClicked,
            data: jdi
        });
    };
});

