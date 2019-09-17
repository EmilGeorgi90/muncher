$(document).ready(function() {
  $("#art").hide();
  $("#dump").hide();
  $("#showResult").hide();
  $("#dialog").hide();
  $("#saveData").hide();
  var url = "";
  const singerType = ['Soprano', 'Tenor', 'Baritone', 'Mezzo-Soprano', 'Bass', 'Bass-Baritone', 'Counter-Tenor', 'Contralto', 'Spoken']
  var result = [];
  json = {
  }
  function getUrlVars()
  {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
  }
  var settings = {
    crossDomain: true,
    url: `http://muncher.truelinked.net/crawler/crawl?url=${getUrlVars().url}&isHtmlResponse=true`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*"
    }
  };
  $.ajax(settings).done(function(response) {
    $("#showResult").show();
    $("#dialog").show();
    document.getElementById("loader").innerHTML = response;
    $("#singer").hide()
    $("#loader").click(function(e) {
      event.preventDefault(e);
      $("#dialog").dialog({
        autoOpen: false,
        show: {
          effect: "blind",
          duration: 500
        },
        hide: {
          effect: "explode",
          duration: 500
        }
      });
      $("#name").val(e.target.textContent);
      $("#professionQualification").change(function(event) {
        if (event.target.value === "role" || event.target.value === "other") {
          $("#art").show();
          for (let index = 0; index < e.target.parentNode.parentNode.children.length; index++) {
              const element =e.target.parentNode.parentNode.children[index].innerText;
              if(e.target.textContent.split(/<\/strong>/g) > 0 && e.target.textContent.split(/<br>/g) > 0) {
                console.log(element)
                for (const iterator of element.split(/<\/strong>/g)) {  
                  console.log(iterator)
                  $("#art").append(
                    `<option value="${iterator}">${iterator}</option>`
                  );
                }
              } else {
                $("#art").append(
                  `<option value="${element}">${element}</option>`
                );
              }
            }
          } else {
            $("#art").hide();
            $("#art").empty();
          }
          if (event.target.value === "selector") {
            if($(e.target).attr("id")){
              $("#name").val('#' + $(e.target).attr('id')) 
            } else {
              $("#name").val('.' + $(e.target).attr('class')) 
            } 
          }
          if(event.target.value === 'Singer'){
            $("#singer").show()
            for(singer of singerType)
            $("#singer").append(`<option value="${singer}">${singer}</option>`)
          } else {
            $("#singer").hide()
            $("#singer").empty()
          }
        });
        $("#dialog").dialog("open");
      });
      $("#submit").click(function(e) {
        event.preventDefault(e);
        const json = {
          name: null,
          profession: null
        };
        if (document.getElementById("art").style.display !== "none") {
          json.profession = "role " + $("#art").val();
        }else if (document.getElementById("singer").style.display !== "none"){
          json.profession = $("#professionQualification").val();
          json.voiceType = $('#singer').val();
        }

          else {
          json.profession = $("#professionQualification").val();
        }
        json.name = $("#name").val();
        result.push(json);
        if ($("#professionQualification").find(":selected").text() === "Selector") {
          window.location.replace(`http://muncher.truelinked.net/manageUrl?selector=${result[0].name}&response=${getUrlVars().url}&name=${getUrlVars().name}`)
        }
        $("#dialog").dialog("close");
        console.log(JSON.stringify(result));
      });
    });
  $("#showResult").click(function() {
    $("#loader").hide();
    $("#dump").show();
    $("#saveData").show();
    if ($("#professionQualification").find(":selected").text() === "Selector") {
    }
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      $("#dump").append(
        "name: " +
          JSON.stringify(element.name).substring(
            0 + 1,
            JSON.stringify(element.name).length - 1
          ) +
          "\n" +
          "profession: " +
          JSON.stringify(element.profession).substring(
            0 + 1,
            JSON.stringify(element.profession).length - 1
          ) +
          "\n" +
          "voice type: " +
          element.voiceType +
          "\n"
      );
    }
  });
  $("#saveData").click(function(e) {
    event.preventDefault(e);
    console.log(result);
    console.log(JSON.stringify(result))
    json = {
      url: getUrlVars().url,
      data: {
        data: result
      }
    }
    var Postsettings = {
      url: `http://muncher.truelinked.net/data?url=${getUrlVars().url}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      data: JSON.stringify(json)
    };

    $.ajax(Postsettings).done(function(response) {
      console.log(response);
    });
  });
});
