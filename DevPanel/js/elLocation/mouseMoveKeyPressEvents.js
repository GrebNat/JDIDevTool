var $actualBachgroundColore;
var $actualElementFromPoint = "";

$(document).on("mouseout", function(e){
    $actualElementFromPoint.style.backgroundColor = $actualBachgroundColore;
});

$(document).on("mouseover", function(e){
    $actualElementFromPoint = e.target;
    $actualBachgroundColore = $actualElementFromPoint.style.backgroundColor;
    e.target.style.backgroundColor = "green";
});

$(document).keypress(function (e) {

    console.log("key pressed");
     if (e.which === 115) {

            var jdi = jdiObject(
                $actualElementFromPoint.getAttribute("jdi-name"),
                $actualElementFromPoint.getAttribute("jdi-type"),
                $actualElementFromPoint.getAttribute("jdi-parent"));

            chrome.runtime.sendMessage({ name: requestName.jdiFromContent,
                                         data: jdi});
            /*chrome.storage.local.get("jdi_object", function (e2) {
                if (e2.jdi_object != undefined)
                    $a = e2.jdi_object;
                console.log("2 from array " + $a);
                $a.push(jdi);
                console.log("3 from array second" + $a);
                chrome.storage.local.set({'jdi_object': $a});
            });*/

        };
});

