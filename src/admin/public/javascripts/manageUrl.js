$(document).ready(function(){
  if(!localStorage.getItem('login')) {
    window.location.replace('/login')
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
  if(getUrlVars().selector){
    var settings = {
      "url": `http://muncher.truelinked.net/addUrl?url=${getUrlVars().response}&orgname=${getUrlVars().name}&selector=${getUrlVars().selector}`,
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json",
      }
    }
    $.ajax(settings).done(function (response) {
      alert('wait for reload');
      location.replace("http://muncher.truelinked.net/manageUrl")
    });
  }
    $('.edit').click(function(e) {
        event.preventDefault(e)
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": `http://muncher.truelinked.net/updateUrl?url=${e.target.parentElement.previousSibling.value}&id=${e.target.parentElement.previousSibling.previousSibling.value}`,
            "method": "PUT",
            "headers": {
              "Accept": "*/*",
              "Cache-Control": "no-cache",
            }
          }
          
          $.ajax(settings).done(function (response) {
          });
    })
    $('#addUrl').click(function(e){
        event.preventDefault(e);
        $(e.target.parentElement).prepend('<h4 class="mt-2">add url</h4>')
        $(e.target.parentElement).prepend('<div class="input-group mb-3"> <input type="text" id="addUrlInput" class="form-control"><div class="input-group-append"><button class="btn btn-outline-secondary" id="addUrlSubmit" type="button">Save Url</button></div></div>')
        $('#addUrlSubmit').click(function(e){
            event.preventDefault(e);
            let name;
            if($('.url').length <= 0) {
              name = prompt("missing organisation/company")
            }
            else {
            console.log($(`.url[value*="${$('#addUrlInput').val().split("/")[2]}"]`).length)
              if($(`.url[value*="${$('#addUrlInput').val().split("/")[2]}"]`).length <= 0) {
                console.log($(`.url`).val().split('/')[2] != $('#addUrlInput').val().split("/")[2])
                name = prompt("missing organisation/company")
              } else {
                name = $(`.url[value*="${$('#addUrlInput').val().split("/")[2]}"]`).parent().parent().first().clone().children().remove().end().text()
              }
            }
            console.log(name)
            if(name === null) {
              return;
            }
            if(!getUrlVars().selector) {
              window.location.replace(`http://muncher.truelinked.net/trainer?url=${$('#addUrlInput').val()}&name=${name}`)
            }
            else {
            var settings = {
              "url": `http://muncher.truelinked.net/addUrl?url=${getUrlVars().url}&orgname=${getUrlVars().name}&selector=${getUrlVars().selector}`,
              "method": "POST",
              "headers": {
              }
            }
              $.ajax(settings).done(function (response) {
                alert('success');
                console.log(response);
                settings.url = `http://muncher.truelinked.net/crawler/crawl?url=${$('#addUrlInput').val()}&selector=${getUrlVars().selector}`
                settings.method = 'GET'
                $.ajax(settings).done(function () {
                  location.replace("http://muncher.truelinked.net/manageUrl")
                })
              });
            }
        })
    })
    $('#search').change(function(e) {
      var settings = {
        "url": `http://muncher.truelinked.net/manageUrl?search=${$('#search').val()}`,
        "method": "GET",
        "headers": {
        }
      }
      $('.formContainer').load(`http://muncher.truelinked.net/manageUrl?search=${$('#search').val()} #form`, function( response, status, xhr ){
        $(".collapsible").click(function(e) {
          if($(e.target.children).css('display') !== 'none') {
            $(e.target.children).hide();
          } else {
            $(e.target.children).css({'display': "flex"});
          } 
        })
      })
    })
    $(".collapsible").click(function(e) {
      if($(e.target.children).css('display') !== 'none') {
        $(e.target.children).hide();
      } else {
        $(e.target.children).css({'display': "flex"});
      } 
    })
})
