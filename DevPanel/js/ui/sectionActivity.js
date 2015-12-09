function drawSectionPage() {

    cleanSectionPage();
    $.each(sections.sectionsArray, function (ind, val) {

        if ($.inArray(val.data.type, sectionTypes) > -1) {
            if (val.data.type === 'Form') {
                var data = translateToJava(val.data);

                var template = $('#template-section-nav-tab-link').html().replace(/{section}/g, ind);
                $('#section-nav-tab').append(template);
                $('#a-section-{0}'.format(ind))
                    .text(data[1].name)
                    .append("<span id='a-close-section-{0}' class='close fa fa-times'></span>".format(ind));

                template = $('#template-sect-nav-cont').html().replace(/{section}/g, ind);
                $('#section-nav-content').append(template);

                fillSection(ind, 1, data[1]);
                fillSection(ind, 2, data[0]);

                downloadAction(ind, 1);
                downloadAction(ind, 2);
            }
            else {
                var data = translateToJava(val.data);

                var template = $('#template-section-nav-tab-link').html().replace(/{section}/g, ind);
                $('#section-nav-tab').append(template);
                $('#a-section-{0}'.format(ind))
                    .text(data[0].name)
                    .append("<span id='a-close-section-{0}' class='close fa fa-times'></span>".format(ind))

                var template = $('#template-sect-nav-cont-nonForm').html().replace(/{section}/g, ind);
                $('#section-nav-content').append(template);

                $('#section-content-{0}'.format(ind))
                    .find('pre')
                    .text(data[0].data)
                    .each(function (i, block) {
                        hljs.highlightBlock(block);
                    });
                ;

            }
            $($("[id^='a-section-']")[1]).tab('show');

            addNavBarEvents();

            $('#a-close-section-{0}'.format(ind)).on('click', function () {

                var sectionId = 'a-section-{0}'.format($(this).attr('id').split("-").pop());
                var sectionIndex = $('#' + sectionId).parent().index();

                $('#{0}'.format(sectionId)).parent().remove();
                $('#section-content-{0}'.format($(this).attr('id').split("-").pop())).remove();

                pages.updatePagesAfterSectionDelete(sectionIndex)
                sections.removeSection(sectionIndex);

                $($('#page-sections ul').children()[0]).tab('show');
            })
        }
    });


}

function cleanSectionPage() {
    $('#section-nav-tab, #section-nav-content').empty();
}
function downloadAction(sectionInd, collapseInd) {
    $('#btn-coll{1}-{0}'.format(sectionInd, collapseInd)).on('click', function () {

        var collPanelId = $(this).parent().find('a').attr('href').substr(1);
        var data = $('#{0} pre'.format(collPanelId)).text();
        var fileName = $(this).parent().find('a').text();

        (new saveFile).asJava([data], fileName)
    })
}

function fillSection(sectionInd, collapseInd, data) {
    $('#section-content-{0} #a-coll{1}-{0}'.format(sectionInd, collapseInd)).text(data.name)
    $('#section-content-{0} #coll{1}-{0}  pre'.format(sectionInd, collapseInd))
        .text(data.data)
        .each(function (i, block) {
            hljs.highlightBlock(block);
        });
}
