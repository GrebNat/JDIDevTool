chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request){
            case requestName.getPageJSONByJDIElements:{
                var json = new jsonPageGenerator(jdiTags, undefined, document);
                sendResponse(json.getJSON());}
                break;
            default:
                alert("wrong responce");
        }
});


