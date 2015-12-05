function drawSectionPage(){

    cleanSectionPage();
    $.each(sections.sectionsArray, function (ind, val) {

        if (sectionTypes.indexOf(val.type) !== -1) {
            var data = translateToJava(val);

            var template = $('#template-section-nav-tab-link').html().replace(/{section}/g, ind);
            $('#section-nav-tab').append(template);
            $('#a-section-{0}'.format(ind)).text(data[1].name);

            template = $('#template-sect-nav-cont').html().replace(/{section}/g, ind);
            $('#section-nav-content').append(template);

            $('#section-content-{0} #a-coll1-{0}'.format(ind)).text(data[1].name)
            $('#section-content-{0} #coll1-{0}  pre'.format(ind)).text(data[1].data);
            $('#section-content-{0} #coll1-{0}  pre'.format(ind)).each(function (i, block) {
                hljs.highlightBlock(block);
            });

            $('#section-content-{0} #a-coll2-{0}'.format(ind)).text(data[0].name)
            $('#section-content-{0} #coll2-{0}  pre'.format(ind)).text(data[0].data);
            $('#section-content-{0} #coll2-{0}  pre'.format(ind)).each(function (i, block) {
                hljs.highlightBlock(block);
            });

            $($("[id^='a-section-']")[1]).tab('show');

            addNavBarEvents();
        }
    });


}

function cleanSectionPage(){
    $('#section-nav-tab').empty();
    $('#section-nav-content').empty();
}