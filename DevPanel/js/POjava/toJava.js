/**
 * Created by Dmitry_Lebedev1 on 9/11/2015.
 */
var result = new Array;
var pname;

var fileTypes = {
    page:"IPage",
    form:"Form",
    pClass:"parameterClass",
}

var Templates = {
    javaPage: function (package, imports, clazz) {
        var p = package === undefined ? "" : "package {0};\n\n".format(package);
        return "{0}{1}\n{2};\n".format(p, imports, clazz)
    },
    imports: function (package) {
        return "import {0};\n".format(package);
    },
    javaClass: function (name, elements) {
        return "public class {0}  {\n{1}\n}".format(name, elements);
    },
    javaClassExtends: function (name, extendz, elements) {
        return "public class {0} extends {1} {\n{2}\n}".format(name, extendz, elements);
    },
    classField: function (elem) {
        var name = elem.name;
        var type = elem.type;
        var locator = elem.locator;
        try {
            return FieldTemplates[type](elem);
        } catch (e) {
            console.log(e + "\n" + "type: " + type + " name: " + name)
            return FieldTemplates.unknown.format(type, name);
        }
    }
}

var moduleSimple = function (elem) {
    return Templates.classField(elem);
}

var ElemTemplates = {
    String: moduleSimple,
    ITextArea: moduleSimple,
    IButton: moduleSimple,
    Section: function (data) {
        filesTemplate.Section(data);
        return moduleSimple(data);
    },
    Form: function (data) {
        filesTemplate.Form(data);
        return moduleSimple(data);
    },
    IPagination: function (data) {
        if (JSON.parse(data.own) === true){
            filesTemplate.IPagination(data);
            return moduleSimple(data);
        }
        return new Pagination(data).print();
    },
    ITimePicker: moduleSimple,
    IDatePicker: moduleSimple,
    IPage: undefined,
    IElement: moduleSimple,
    ITextField: moduleSimple,
    RFileInput: moduleSimple,
    IRange: moduleSimple,
    ITable: moduleSimple,
}

var filesTemplate = {
    IPagination: function (rawData) {
        var data = jQuery.extend(true, {}, rawData)
        //var data = JSON.parse(JSON.stringify(rawData));
        data.name = data.name.capitalizeFirstLetter();
        FieldTemplates[data.type] = function (elem) {
            return "\n\tpublic {0} {1};\n".format(data.name, elem.name.downFirstLetter());
        };
        var genClass = JSON.parse(JSON.stringify(data));
        var c = new JavaClass(genClass);
        result.push(createRecord(c));
    },
    Section: function(data) {
        data.extendz = "{0}".format(data.type);
        data.type = data.name.capitalizeFirstLetter();
        FieldTemplates[data.type] = function (elem) {
            return "\n\tpublic {0} {1};\n".format(elem.type, elem.name.downFirstLetter());
        };
        var c = new JavaClass(data);
        c.includes.push(IncludesDictionary.by);
        c.includes.push(IncludesDictionary.fundBy);
        c.includes.push(IncludesDictionary.Section);
        c.classParam = data.gen;
        c.type = fileTypes.form;
        result.push(createRecord(c));

    },
    Form: function (data) {
        data.name = data.name.capitalizeFirstLetter();
        var genClass = JSON.parse(JSON.stringify(data));
        var classParam = genClass.name = data.gen;
        genClass.type = undefined;
        genClass.extendz = undefined;
        $.each(genClass.elements, function (i, val) {
            if (ConvertToJavaType[val.type] !== undefined) {
                val.type = ConvertToJavaType[val.type];
            } else {
                val.type += " ";
            }
        });
        var cc = new JavaClass(genClass);
        cc.type = fileTypes.pClass;
        var fP = createRecord(cc);
        result.push(fP);
        //
        data.extendz = "{0}<{1}>".format(data.type, data.gen);
        data.type = data.name;
        FieldTemplates[data.type] = function (elem) {
            return "\n\tpublic {0} {1};\n".format(elem.type, elem.name.downFirstLetter());
        };
        IncludesDictionary[data.type] = "my.package.{0}".format(data.type);
        var c = new JavaClass(data);
        c.includes.push(IncludesDictionary.by);
        c.includes.push(IncludesDictionary.fundBy);
        c.includes.push(IncludesDictionary.Form);
        c.classParam = classParam;
        c.type = fileTypes.form;
        result.push(createRecord(c));
    },
    IPage: function (data) {
        data.extendz = "Page";
        var c = new JavaClass(data);
        c.includes.push(IncludesDictionary.by);
        c.includes.push(IncludesDictionary.fundBy);
        c.includes.push(IncludesDictionary.Page);
        c.type = fileTypes.page;
        result.push(createRecord(c));
    }
};

var JavaClass = function (src) {
    this.name = src.name;
    this.extendz = src.extendz;
    this.includes = new Array;
    this.package = pname;
    this.elements = src.elements;
    this.type = src.type;

    this.genName = function (name) {
        return src.title === undefined ? src.name : src.title;
    }
    this.genIncludes = function () {
        var inc = this.includes;
        $.each(this.elements, function (i, val) {
            var temp = (IncludesDictionary[val.type] !== undefined) ? IncludesDictionary[val.type] : "";
            if (inc.indexOf(temp) < 0) {
                inc.push(temp);
            }
        });
        this.includes = inc;
    }
    this.getIncludes = function () {
        var total = "";
        $.each(this.includes, function (i, val) {
            total += val.length > 0 ? Templates.imports(val) : "";
        });
        return total;
    }
    this.getElements = function () {
        var total = "";
        $.each(this.elements, function (i, val) {
            try {
                total += ElemTemplates[val.type](val);
            } catch (e) {
                total += "\t/*{0} {1}*/\n".format(val.type, val.name);
            }
        });
        return total;
    }
    this.genClass = function () {
        var elements = this.getElements();
        this.genIncludes();
        return (this.extendz === null || this.extendz === undefined) ? Templates.javaClass(this.name, elements) : Templates.javaClassExtends(this.name, this.extendz, elements);
    }
    this.print = function () {
        var clazz = this.genClass();
        return Templates.javaPage(this.package, this.getIncludes(), clazz);
    }

    this.name = this.genName(src.name);
};

var processJSON = function (data) {
    filesTemplate[data.type](data);
}

var getCombElements = function () {
    var ress = [];
    var baseRes = deepCopy(result);
    $.each(baseRes, function(i, e){
        switch (e.type){
            case fileTypes.page:
                ress.push(e);
                break;
            case fileTypes.form:
                e.elements = e.elements === undefined ? [] : e.elements;
                var name = e.classParam;
                e.elements.push(jQuery.grep(result, function(e, i){ return e.name === name} ));
                ress.push(e);
                break;
            case fileTypes.pClass:
                break;
        }
    });
    return ress;
}

function translateToJava(rawData) {
    var data = JSON.parse(JSON.stringify(rawData));
    pname = data.packageName;
    result = new Array;
    processJSON(data);
    result.getCombElements = getCombElements;
    return result;
}