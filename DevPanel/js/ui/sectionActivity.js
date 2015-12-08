function drawSectionPage(){

    cleanSectionPage();
    $.each(sections.sectionsArray, function (ind, val) {

        if (sectionTypes.indexOf(val.data.type) !== -1) {
            var data = translateToJava(val.data);

            var template = $('#template-section-nav-tab-link').html().replace(/{section}/g, ind);
            $('#section-nav-tab').append(template);
            $('#a-section-{0}'.format(ind))
                .text(data[1].name)
                .append("<button id='a-close-section-{0}' class='close'>×</button>".format(ind));

            template = $('#template-sect-nav-cont').html().replace(/{section}/g, ind);
            $('#section-nav-content').append(template);

            fillSection(ind, 1, data[1]);
            fillSection(ind, 2, data[0]);

            downloadAction(ind, 1);
            downloadAction(ind, 2);

            $($("[id^='a-section-']")[1]).tab('show');

            addNavBarEvents();

            $('#a-close-section-{0}'.format(ind)).on('click', function () {

                var sectionIndex = $(this).attr('id').split("-").pop();
                var sectionId = 'a-section-{0}'.format(sectionIndex);

                $('#{0}, [href="#{0}"]'.format(sectionId)).remove();

                pages.updatePagesAfterSectionDelete(sectionIndex)
                sections.removeSection(sectionIndex);

            })
        }
    });


}

function cleanSectionPage(){
    $('#section-nav-tab, #section-nav-content').empty();
}
function downloadAction(sectionInd, collapseInd){
    $('#btn-coll{1}-{0}'.format(sectionInd, collapseInd)).on('click', function(){

        var collPanelId = $(this).parent().find('a').attr('href').substr(1);
        var data = $('#{0} pre'.format(collPanelId)).text();
        var fileName = $(this).parent().find('a').text();

        (new saveFile).asJava([data], fileName)
    })
}

function fillSection(sectionInd, collapseInd, data){
    $('#section-content-{0} #a-coll{1}-{0}'.format(sectionInd, collapseInd)).text(data.name)
    $('#section-content-{0} #coll{1}-{0}  pre'.format(sectionInd, collapseInd))
        .text(data.data)
        .each(function (i, block) {
        hljs.highlightBlock(block);
    });
}
