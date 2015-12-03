/* global _sectionTypes, sectionTypes */

var Pages = function () {
    this.pagesArray = [];

    this.addNewPage = function (page) {
        this.pagesArray.push(page);
        return this.getPageIndex(page.url, page.id);
    };

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

    this.getPageIndexByURLandID = function (url, id) {

        indByID = getIndex(this.pagesArray, "id", id);
        indByURL = getIndex(this.pagesArray, "url", url);
        if (indByID === indByURL && indByID !== undefined) {
            return indByID;
        }
        return -1;
    }

    this.updatePageData = function (data) {

        var ind = this.getPageIndex(data.url, data.id);
        this.pagesArray[ind].data = data.data;
        this.pagesArray[ind].url = data.url;

        return this.pagesArray[ind];
    }

    this.addSectionObjects = function (pageId, sections) {

        for (var ind in this.getPageByID(pageId).data.elements) {
            val = this.getPageByID(pageId).data.elements[ind];

            if (sectionTypes.indexOf(val.type) !== -1) {
                var sectionIndex = sections.getSectionIndex(val.locator);
                if (sectionIndex === -1)
                    sectionIndex = sections.addNewSection(val);
                else
                    sectionIndex = sections.updateSection(val.locator, val.data);

                this.getPageByID(pageId).data.elements[ind] = sections.getSectionByIndex(sectionIndex);
            }

        }
        ;
    }

};

function page(id, url, data) {
    return {
        id: id,
        url: url,
        data: data
    };
}

