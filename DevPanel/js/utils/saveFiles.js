var saveFile = function() {

    this.asJava = function (data, fileName){
        var blob = new Blob(data, {type: "text/plain;charset=utf-8"});
        saveAs(blob, "{0}.java".format(fileName));
    };

}