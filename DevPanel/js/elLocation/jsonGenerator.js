/**
 * Created by Dmitry_Lebedev1 on 19/11/2015.
 */

Document.prototype.querySelectorAllArray = function (selector) {
  return Array.prototype.slice.call(this.querySelectorAll(selector));
}

Element.prototype.getCAttribute = function (name) {
  return this.hasAttribute(name) ? this.getAttribute(name) : undefined;
}

$.prototype.getCAttribute = function (name) {
  return this.attr(name);
}

var structElement = function (rawElement, spec) {
  var temp = jdiObject(
      rawElement.getCAttribute(spec.jdi_name),
      rawElement.getCAttribute(spec.jdi_type),
      rawElement.getCAttribute(spec.jdi_gen),
      new Array,
      "[{0}={1}]".format(spec.jdi_name, rawElement.getCAttribute(spec.jdi_name))
  );
  temp.parent = rawElement.getCAttribute(spec.jdi_parent);
  temp.toJSON = function(){
    return {
      type: this.type,
      name: this.name,
      gen: this.gen,
      locator: this.locator,
      elements: this.elements.length === 0 ? undefined : this
          .elements,
    }
  }
  return temp;
}

var structPage = function (packageName) {
  this.name = location.pathname;
  this.url = document.URL;
  this.type = "IPage";
  //this.packageName = packageName;
  this.elements = [];
  this.title = document.title;
  this.toJSON = function () {
    return {
      name: this.name,
      url: this.url,
      type: this.type,
      packageName: this.packageName,
      elements: this.elements,
      title: this.title,
    }
  }
}

var jsonPageGenerator = function (attrSpec, options, container) {
  var _container = container instanceof $ ? container.get(0) : container;
  var _attrSpec = attrSpec;
  var _page = undefined;
  var _options = options;

  this.getJDIElements = function () {
    return _container.querySelectorAllArray("[" + _attrSpec.jdi_type + "]");
  }

  this.rawElement2Json = function (rawElement) {
    return new structElement(rawElement, _attrSpec);
  };

  this.filterParent = function (element) {
    if (element.parent !== undefined)
      return element;
  }

  this.filterRoot = function (element) {
    if (element.parent === undefined)
      return element;
  }

  this.process = function (prn, cld) {
    for (var i = 0; i < cld.length; i++) {
      for (var j = 0; j < prn.length; j++) {
        if (prn[j].elements !== undefined)
          if (prn[j].elements.length > 0) {
            this.process(prn[j].elements, cld);
          }
        j = (prn[j] === undefined) ? 0 : j;
        i = (cld[i] === undefined) ? 0 : i;
        if (prn[j].name === cld[i].parent) {
          prn[j].elements.push(cld.splice(i, 1)[0]);
          i = j = -1;
          break;
        }
      }
    }
  }

  this.processPageElements = function (array) {
    try {
      var rawElements = array;
      var allElements = jQuery.map(rawElements, this.rawElement2Json);
      var rootElements = jQuery.map(allElements, this.filterRoot);
      var childElements = jQuery.map(allElements, this.filterParent);
      this.process(rootElements, childElements);
      return rootElements;
    } catch (e){
      console.log(e);
    }
  };

  this.translatePage2Struct = function () {
    var elements = this.getJDIElements();
    _page = new structPage();
    //_page = new structPage(_options.packageName);
    _page.elements = this.processPageElements(elements);
  };

  this.getPageStruct = function () {
    if (_page === undefined)
      this.translatePage2Struct();
    return _page;
  };

  this.getJSON = function (replacer, space) {
    if (_page === undefined) {
      this.translatePage2Struct();
    }
    return JSON.stringify(_page, replacer, space);
  };
};