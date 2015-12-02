/**
 * Created by Dmitry_Lebedev1 on 10/11/2015.
 */

var IncludesDictionary = {
    ITextArea:      "com.ggasoftware.jdiuitests.implementation.selenium.elements.interfaces.common.ITextArea",
    IButton:        "com.ggasoftware.jdiuitests.implementation.selenium.elements.interfaces.common.IButton",
    Form:           "com.ggasoftware.jdiuitests.implementation.selenium.elements.composite.Form",
    Section:        "com.ggasoftware.jdiuitests.implementation.selenium.elements.composite.Section",
    IPagination:    "com.ggasoftware.jdiuitests.implementation.selenium.elements.composite.Pagination",
    ITimePicker:    "/*com.epam.jdi.ITimePicker*/",
    IDatePicker:    "com.ggasoftware.jdiuitests.implementation.selenium.elements.interfaces.common.IDatePicker",
    IPage:          "import com.ggasoftware.jdiuitests.implementation.selenium.elements.composite.Page",
    IElement:       "com.ggasoftware.jdiuitests.implementation.selenium.elements.interfaces.base.IElement",
    ITextField:     "com.ggasoftware.jdiuitests.implementation.selenium.elements.interfaces.common.ITextField",
    RFileInput:     "com.ggasoftware.jdiuitests.implementation.robot.elements.common.RFileInput",
    IRange:         "/*com.epam.jdi.IRange*/",
    Page :          "com.ggasoftware.jdiuitests.implementation.selenium.elements.composite.Page",
    by:             "org.openqa.selenium.By",
    fundBy:         "org.openqa.selenium.support.FindBy",
    ITable:         "com.ggasoftware.jdiuitests.implementation.selenium.elements.complex.table.interfaces.ITable"
}

var ConvertToJavaType = {
    ITextArea: "String",
    ITextField: "String",
}

function simpleFileld(elem) {
    var fby = FindByTemplates.css(elem.locator);
    var field = "\tpublic {0} {1};\n".format(elem.type, elem.name);
    return fby + field;
}

var FieldTemplates = {
    unknown: "\n\t/*{0} {1}*/\n",
    String:  function(elem) {
        return "\tpublic {0} {1};\n".format(elem.type, elem.name);
    },
    Section: simpleFileld,
    ITextArea: simpleFileld,
    IButton: simpleFileld,
    Form: simpleFileld,
    IPage: simpleFileld,
    IElement: simpleFileld,
    ITextField: simpleFileld,
    IPagination: function (elem) {
        return "\n\tpublic Pagination {0} = new Pagination({1}, {2}, {3}, {4}, {5});\n".format(
            elem.name, elem.get("template"), elem.get("next"), elem.get("prev"), elem.get("first"), elem.get("last")
        );
    },
    IDatePicker: simpleFileld,
    RFileInput: simpleFileld,
    ITable: simpleFileld,
}

var Pagination = function (element) {
    this.name = element.name;
    this.elems = new Array;

    this.get = function (key) {
        return (this.elems[key] === undefined) ? "\n\t\tnull" : FindByTemplates.byCss(this.elems[key].name)
    }
    this.print = function () {
        return FieldTemplates.IPagination(this);
    }

    var res = new Array;
    $.each(element.elements, function (index, value) {
        res[value.name] = value;
    });
    this.elems = res;
}

var FindByTemplates = {
    css: function (selector) {
        return "\n\t@FindBy(css = \"{0}\")\n".format(selector);
    },
    byCss: function (selector) {
        return "\n\t\tBy.cssSelector(\"[jdi-name={0}]\")".format(selector);
    }
}

var createRecord = function(data){
    return {
        name : data.name,
        classParam: data.classParam,
        type: data.type,
        data : data.print(),
    }
}

var deepCopy = function (obj) {
    return JSON.parse(JSON.stringify(obj));
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.downFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}