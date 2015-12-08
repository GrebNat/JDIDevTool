/**
 * Created by Natalia_Grebenshchik on 12/2/2015.
 */

var Sections = function () {

    this.sectionsArray = [];

    this.addNew_UpdateOnExists = function (section) {
        if (this.getSection(section.locator) !== -1)
            return this.addNewSection(section);

        return this.updateSection(section.locator, section.data);
    }

    this.updateSection = function (locator, newData) {
        var ind = this.getSectionIndex(locator);
        this.sectionsArray[ind].data = newData;

        return ind;
    };


    this.removeSectionByLocator = function (locator){
        var sectionIndex = this.getSectionIndex(locator);
        this.sectionsArray.locator = "";
        this.sectionsArray.data = {};
    }
    this.removeSection = function (index){
        this.sectionsArray.splice(index, 1);
    }


    this.addNewSection = function (section) {
        this.sectionsArray.push(section)
        return this.getSectionIndex(section.locator);
    };


    this.getSectionIndex = function (locator) {
        return getIndex(this.sectionsArray, "locator", locator);
    };

    this.getSection = function (locator) {
        var ind = this.getSectionIndex(locator)
        return this.sectionsArray[ind];
    };

    this.getSectionByIndex = function (ind) {
        return this.sectionsArray[ind];
    }

};

function section(locator, data) {
    return{
        locator: locator,
        data: data
    };
}


