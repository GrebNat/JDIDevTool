/* global _sectionTypes, sectionTypes */

var Pages = function () {
    this.pagesArray = [];

    this.addNewPage = function (page) {
        this.pagesArray.push(page);
        return this.getPageIndex(page.url, page.id);
    };

    this.addBean = function (pageId, elSequence, bean) {
        var page = this.getPageByID(pageId).data;

        for (ind in elSequence)
            page = page.elements[elSequence[ind]];

        if (page.elements === undefined)
            page.elements = [];

        page.elements.push(bean);
    }


    this.addSectionObjects = function (pageId, sections) {

        for (var ind in this.getPageByID(pageId).data.elements) {
            var val = this.getPageByID(pageId).data.elements[ind];

            if (sectionTypes.indexOf(val.type) !== -1) {
                var sectionIndex = sections.getSectionIndex(val.locator);
                if (sectionIndex === -1)
                    sectionIndex = sections.addNewSection(section(val.locator, val));
                /* else
                 sectionIndex = sections.updateSection(val.locator, val);*/

                this.getPageByID(pageId).data.elements[ind] = sections.getSectionByIndex(sectionIndex).data;
            }

        }
        ;
    }
    this.updatePagesAfterSectionDelete = function (sectionIndex) {

        var section = sections.getSectionByIndex(sectionIndex).data;

        for (var pageInd in this.pagesArray) {
            for (var elInd in this.pagesArray[pageInd].data.elements) {
                if (this.pagesArray[pageInd].data.elements[elInd] === section)
                    this.pagesArray[pageInd].data.elements.splice(elInd, 1);
            }
        }
    }


    this.updatePageData = function (data) {

        var ind = this.getPageIndex(data.url, data.id);
        this.pagesArray[ind].data = data.data;
        this.pagesArray[ind].url = data.url;

        return this.pagesArray[ind];
    }

    this.updateBeanData = function (pageId, elSequence, newValue) {

        var el = new Object();
        el = this.getPageByID(pageId).data;

        for (var ind in elSequence)
            el = el.elements[elSequence[ind]];

        if ('locator' in newValue)
            el.locator = newValue.locator;
        if ('name' in newValue) {
            el.name = newValue.name;
        }
        if ('gen' in newValue) {
            el.gen = newValue.gen;
        }
        if ('section' in newValue) {
            el.section = newValue.section;
        }
        if ('type' in newValue) {
            if ($.inArray(newValue.type, sectionTypes) > -1) {
                if ($.inArray(el.type, sectionTypes) > -1) {
                    el.type = newValue.type;
                    return;
                }
                else {
                    el.type = newValue.type;
                    var sectionIndex = sections.addNewSection(section(el.locator, el));

                    var elT = this.getPageByID(pageId).data.elements;

                    for (var i = 0; i < elSequence.length; i++)
                        if (i === elSequence.length - 1)
                            elT.splice(elSequence[i], 1, sections.getSectionByIndex(sectionIndex).data);
                        else
                            elT = elT[elSequence[i]].elements;
                }
            }
            else {
                el.type = newValue.type;
                return
            }


            /* var sectionIndex = sections.addNewSection(section(el.locator, el));
             // this.getPageByID(pageId).data.elements[ind] = sections.getSectionByIndex(sectionIndex);

             var elT = this.getPageByID(pageId).data.elements;
             for (var i = 0; i < elSequence.length; i++) {

             if (i === elSequence.length - 1) {

             //  var elT  =  elT[elSequence[i]].elements;
             elT.splice(elSequence[i], 1, sections.getSectionByIndex(sectionIndex));

             }
             else
             elT = elT[elSequence[i]].elements;
             }*/
        }
    }

    this.removeBean = function (pageId, elSequence) {
        var el = new Object();
        el = this.getPageByID(pageId).data.elements;

        for (var i = 0; i < elSequence.length; i++) {
            if (i === elSequence.length - 1)
                el.splice(elSequence[i], 1);
            else {
                el = el[elSequence[i]].elements;
            }
        }
    }

    this.upChildren = function (pageId, elSequence) {
        var el = new Object();
        el = this.getPageByID(pageId).data.elements;

        for (var i = 0; i < elSequence.length; i++) {
            if (i === elSequence.length - 1) {

                var elT = el[elSequence[i]].elements;

                el.splice(elSequence[i], 1);

                for (var j = elT.length - 1; j >= 0; j--) {
                    el.splice(elSequence[i], 0, elT[j]);
                }
            }
            else
                el = el[elSequence[i]].elements;
        }
    }

    this.removePage = function (pageId) {
        var index = this.getPageIndexById(pageId);

        this.pagesArray[index].url = "";
        this.pagesArray[index].data = {};
    }


    this.getPageByID = function (id) {
        return this.pagesArray[getIndex(this.pagesArray, "id", id)];
    }

    this.getPageByURL = function (url) {
        return this.pagesArray[getIndex(this.pagesArray, "url", url)];
    }

    this.getPageIndex = function (url, id) {
        if (id !== undefined)
            return getIndex(this.pagesArray, "id", id)
        else if (url !== undefined)
            return getIndex(this.pagesArray, "url", url)
        else
            return -1;
    }

    this.getPageIndexById = function (id) {
        if (id !== undefined)
            return getIndex(this.pagesArray, "id", id);
        return -1;
    }

    this.getPageIndexByURLandID = function (url, id) {

        indByID = getIndex(this.pagesArray, "id", id);
        indByURL = getIndex(this.pagesArray, "url", url);
        if (indByID === indByURL && indByID !== undefined) {
            return indByID;
        }
        return -1;
    }

};

function page(id, url, data) {
    return {
        id: id,
        url: url,
        data: data
    };
}

