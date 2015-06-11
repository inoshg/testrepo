function forum_load_topics(page, search) {
    var params = {};
    if (page == undefined) {
        page = 1
    }
    params.page = page;
    if (search != undefined) {
        params.search = search;
    }
    $.getJSON(requestURL + '/forum/api/topic', params, function (result) {
        console.log(result);
        if (result.error == false) {
            var template = Handlebars.partials['topic_list']({ 'topics': result.data });
            $('#forum_topic_list').html(template);
            //set the pages
            $('#pages').html();
            var options = {
                currentPage: result.page,
                totalPages: result.total_pages,
                alignment: 'right',
                onPageClicked: function (e, originalEvent, type, page) {
                    forum_load_topics(page);
                }
            }
            $('#pages').bootstrapPaginator(options);
        }
        else {
            jagg.message({content: result.message, type: "error"});
        }
    });
}


function forum_load_replies(page) {
    var params = {};
    if (page == undefined) {
        page = 1
    }
    params.page = page;

    var currentLocation = window.location.pathname;
    var id = currentLocation.split('/').pop();


    $.getJSON(requestURL + '/forum/api/topic/' + id, params, function (result) {
        console.log(result);
        if (result.error == false) {
            var template = Handlebars.partials['reply_list']({ 'replies': result.data });
            $('#forum_reply_list').html(template);
            //set the pages
            $('#pages1').html();
            var options = {
                currentPage: result.page,
                totalPages: result.total_pages,
                alignment: 'right',
                onPageClicked: function (e, originalEvent, type, page) {
                    forum_load_replies(page);
                }
            }
            $('#pages1').bootstrapPaginator(options);
        }
        else {
            jagg.message({content: result.message, type: "error"});
        }
    });
}


$(document).ready(function () {

    //load the first page
    if ($('#forum_topic_list').length) {
        var source = $("#template_topic_list").html();
        Handlebars.partials['topic_list'] = Handlebars.compile(source);
        forum_load_topics(1);
    }
  //load reply list first page
    if ($('#forum_reply_list').length) {
        var source = $("#template_reply_list").html();
        Handlebars.partials['reply_list'] = Handlebars.compile(source);
        forum_load_replies(1);
    }


    //delete topic
    $('.delete_topic').live("click", function (event) {
        $.ajax({
            type: 'DELETE',
            url: requestURL + '/forum/api/topic/' + $(this).attr('data-id'),
            data: "",
            dataType: 'html',
            success: function (data) {

                forum_load_topics(1)


            }
        });
    });


    //bind to search input enter key
    $('#forum_topic_search_value').keypress(function (e) {
        if (e.which == 13) {
            forum_load_topics(1, $('#forum_topic_search_value').val());
        }
    });
    //bind to search button
    $('#forum_topic_search').click(function () {
        forum_load_topics(1, $('#forum_topic_search_value').val());
    })

    $('#summernote').summernote({
        height: 300
    });
    $('#summernote1').summernote({
        height: 100
    });

     //add new forum topic
    $('#add-forum-topic').click(function () {
        var currentLocation = window.location.pathname;
        var id = currentLocation.split('/').pop();

        // alert( $('#subject').val());
        var topic = {
            "subject": $('#subject').val(),
            "description": $('#summernote').code()
        };
        $.ajax({
            type: 'POST',
            url: requestURL + '/forum/api/topic/',
            data: JSON.stringify(topic),
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                window.location = requestURL + '/forum/topic/' + result.id;
            }
        });

    });

    //add new forum reply
    $('#add-forum-reply').click(function () {
        var currentLocation = window.location.pathname;
        var id = currentLocation.split('/').pop();

        var date = new Date();
        var time = date.getTime();

        var htmlContent = getDate(date) + " <br/>" + getTime(time) + " <br/> Reply Succesfully Added ";
        var summernoteContent = $('#summernote1').code();
        $('#reply_list_tr').show();
        $('#rely_list_td1').html(htmlContent);
        $('#rely_list_td2').html(summernoteContent);

        setTimeout(function () {
            $('#reply_list_tr').hide();
            forum_load_replies(1);

        }, 12000);


        var topic = {
            "reply": $('#summernote1').code(),
            "topicId": id
        };

        jagg.post("/forum/api/reply", {
            topic: JSON.stringify(topic)

        }, function (result) {
            if (result.error == false) {
                var sHTML = "";
                $("#summernote1").code(sHTML);
            } else {
                jagg.message({content: result.message, type: "error"});
            }
        }, "json");


    });


    //delete reply
    $('.delete_reply').live("click", function (event) {

        $.ajax({
            type: 'DELETE',
            url: requestURL + '/forum/api/reply/' + $(this).attr('data-id'),
            data: "",
            dataType: 'html',
            success: function (data) {

                forum_load_replies(1)


            }
        });
    });


    $('.edit_reply').live("click", function (event) {

        var currentLocation = window.location.pathname;
        var topicId = currentLocation.split('/').pop();
        var reply = $(this).parent().next().html();
        var id = $(this).data('id');

        $td = $("td[data-id *= " + id + "]");
        $($td[0]).hide();
        $($td[1]).show();
        $summernote = $("div[data-id *= " + id + "]");
        $($summernote).summernote({
            height: 100
        });
        var sHTML = reply;
        $($summernote).code(sHTML);


    });

    // add modified reply
    $(document).on("click", '.edit_forum_reply', function (event) {

        var currentLocation = window.location.pathname;
        var topicId = currentLocation.split('/').pop();
        var replyId = $(this).data('id');
        $summernote = $("div[data-id *= " + replyId + "]");
        $($summernote).code();

        var topic = {
            "replyId": replyId,
            "reply": $($summernote).code(),
            "topicId": topicId
        };
        $.ajax({
            type: 'PUT',
            url: requestURL + '/forum/api/reply',
            data: JSON.stringify(topic),
            contentType: "application/json",
            dataType: 'html',
            success: function () {
                forum_load_replies(1);
            }
        });

    });


    $(document).on("click", '.edit_cancel', function (event) {

        forum_load_replies(1);

    });

    $('.edit_topic_icon').live("click", function (event) {

        var currentLocation = window.location.pathname;
        var topicId = currentLocation.split('/').pop();

        var subject = $('#topic').text();
        $('#topic').hide();
        $('#topic_edit').show();
        var input = document.createElement("input");
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'subject');
        input.setAttribute('placeholder', subject);
        input.setAttribute('class', 'input-block-level')
        input.setAttribute('value', subject)
        $('#input_inside').append(input);

        var description = $('#description_content').html();
        $('#desciption').hide();
        $('#descritpion_edit').show();
        $summernote = $("div[id *='summernote3']");
        $($summernote).summernote({
            height: 100
        });
        var sHTML = description;
        $($summernote).code(sHTML);


    });

    //add modified topic
    $(document).on("click", '.edit_forum_topic', function (event) {

        var currentLocation = window.location.pathname;
        var topicId = currentLocation.split('/').pop();
        var replyId = $(this).data('id');
        $summernote = $("div[data-id *= " + replyId + "]");
        $($summernote).code();

        var topic = {
            "subject": $('#subject').val(),
            "description": $('#summernote3').code(),
            "topicId": topicId
        };
        $.ajax({
            type: 'PUT',
            url: requestURL + '/forum/api/topic/',
            data: JSON.stringify(topic),
            contentType: "application/json",
            dataType: 'html',
            success: function () {
                forum_load_replies(1);
            }
        });


    });


});

function getDate(date) {
    var dateStr = date.toString();
    var splitArray = dateStr.split(" ");
    var createdDate = splitArray[0] + " " + splitArray[1] + " " + splitArray[2] + " " + splitArray[3];
    return createdDate;
}

function getTime(time) {
    var date = new Date(time);
    var strArray = date.toString().split(" ");
    return strArray[4];
}


