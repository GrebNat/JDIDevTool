var $actualBachgroundColore = "";
var $actualElementFromPoint = "";

function addMouseMoveAndKeyPressEvent() {

    $(document).on("mouseout", function (e) {
        restoreActualElementColor();
        restoreAllElementsHighlighting(originColors);
    });

    $(document).on("mouseover", function (e) {
        fillActualElementColor(e.target);
        e.target.style.backgroundColor = "#93DBD5";
        restoreAllElementsHighlighting(originColors);
    });

    $(document).keypress(function (e) {

        if (e.which === 115) {
            var jdi = jdiObject(
                $actualElementFromPoint.getAttribute("jdi-name"),
                $actualElementFromPoint.getAttribute("jdi-type"),
                undefined,
                undefined,
                "[jdi-name=" + $actualElementFromPoint.getAttribute("jdi-name") + ']');

            chrome.runtime.sendMessage({
                name: requestName.jdiFromContentSaveClicked,
                data: jdi
            });
        }
        ;
    });
}

function releaseMouseMoveAndKeyPressEvent() {

    restoreActualElementColor();

    $(document).off("mouseout");
    $(document).off("mouseover");
    $(document).off("keypress");
}

function restoreActualElementColor() {
    if ($actualElementFromPoint !== "" && $actualElementFromPoint !== undefined)
        $actualElementFromPoint.style.backgroundColor = $actualBachgroundColore;

    $actualBachgroundColore = "";
    $actualElementFromPoint = "";
}

function fillActualElementColor(target) {
    $actualElementFromPoint = target;
    $actualBachgroundColore = $(target).css('background-color');
}

