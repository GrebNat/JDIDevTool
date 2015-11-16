document.addEventListener('DOMContentLoaded', function () {

    var button = document.getElementById('btn-col');
    button.addEventListener('click', function () {
        if ($("#btn-col").text() == "V") {
            $("#btn-col").text(">");
            $("#div-col").css("display", "none");
            $("#div-col-none").css("display", "block");
        }
        else {
            $("#btn-col").text("V");
            $("#div-col").css("display", "block");
            $("#div-col-none").css("display", "none");
        }
    });
})
