/**
 * Created by Natalia_Grebenshchik on 12/2/2015.
 */

var Sections = function () {

    this.sectionsArray = [];

    this.addNew_UpdateOnExists = function (section) {
        if (this.getSection(section.sectionName) !== -1)
            return this.addNewSection(section);

        return this.updateSection(section.sectionName, section.data);
    }

    this.updateSection = function (sectionName, newData) {
        var ind = this.getSectionIndex(sectionName);
        this.sectionsArray[ind].data = newData;

        return ind;
    };


    this.removeSectionByName = function (sectionName){
        var sectionIndex = this.getSectionIndex(sectionName);
        this.sectionsArray.sectionName = "";
        this.sectionsArray.data = {};
    }
    this.removeSection = function (index){
        this.sectionsArray.splice(index, 1);
    }


    this.addNewSection = function (sec) {
        this.sectionsArray.push(sec);
        return this.getSectionIndex(sec.sectionName);
    };


    this.getSectionIndex = function (sectionName) {
        return getIndex(this.sectionsArray, "sectionName", sectionName);
    };

    this.getSectionIndexByData = function (sectionData) {
        return getIndex(this.sectionsArray, "data", sectionData);
    }

    this.getSection = function (sectionName) {
        var ind = this.getSectionIndex(sectionName)
        return this.sectionsArray[ind];
    };

    this.getSectionByIndex = function (ind) {
        return this.sectionsArray[ind];
    }

};

function section(sectionName, data) {
    var obj = new Object();

    obj.data = data;
    obj.data.section = sectionName;
    obj.sectionName = obj.data.section;

    return obj;
}


