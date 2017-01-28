
function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        console.log(reader.result.toString())
        window.base64 = reader.result.toString();
        return reader.result.toString();
    };
    reader.onerror = function(error) {
        console.log('Error: ', error);
    };
}

function resizeBase64Img(base64, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var deferred = $.Deferred();
    $("<img/>").attr("src", base64).on('load', function() {
        context.scale(width / this.width, height / this.height);
        context.drawImage(this, 0, 0);
        deferred.resolve($("<img/>").attr("src", canvas.toDataURL("image/jpeg")).hide());
    });
    return deferred.promise();
}


$("#snap2").click(function() {
    $("#load").show();
    var str1 = $("#entertext").val()
    var str2 = str1.replace(/\n|\r/g, "");
    var file2 = document.querySelectorAll('input[type="file"]')[0].files[0];
    getBase64(file2);
    setTimeout(function() {
        var oldBase64 = window.base64;
        $("body").append("<img src=" + oldBase64 + " style='display:none'></img>");
        resizeBase64Img(window.base64, 600, 1000).then(function(newImg) {
            window.base64new = newImg[0].src.toString();
            console.log(window.base64new);
            $("body").append("<br/>").append(newImg);
            $.post("https://api.ocr.space/parse/image", {
                    apikey: "196fec4daf88957",
                    base64Image: window.base64new,
                    language: "eng",
                    isOverlayRequired: "false"
                })
                .done(function(data, status) {
                    window.datanew = data;
                    $("#load").hide();
                    $("#matchp").show();
                    $("#status").html("<p>done</p>");
                    $("#content").html("<p> Captured Text<br><br>" + window.datanew["ParsedResults"][0]["ParsedText"] + "</p>");
                    $("#match").html(similarity(str2,window.datanew["ParsedResults"][0]["ParsedText"])*100+"%");
                    console.log(similarity(str2,window.datanew["ParsedResults"][0]["ParsedText"]));

                })
                .fail(function() {
                    alert("error");
                });
        });


    }, 1000);


});

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

