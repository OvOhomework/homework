/*
 * @Author: your name
 * @Date: 2021-12-12 17:04:42
 * @LastEditTime: 2021-12-26 20:47:56
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \work\NodejsBlogSystem\public\js\custom.js
 */
console.log("Client side JS loaded... ");

//loading the ck editor in body tag
CKEDITOR.replace("body");


$(document).ready(function() { 
  // disappear alert after 7 secs
  $(".alert")
    .delay(10000)
    .slideUp(1000, function() {
      $(this).alert("close");
    });


  // ajax req to delete post
  $(".delete-post").on("click", e => {
    $target = $(e.target);
    const id = $target.attr("data-id");
    
    $.ajax({
      type: "DELETE",
      url: "/posts/" + id,
      success: function(response) {
        alert(response);
        window.location.href = "/";
      },
      error: err => console.log(err)
    });
  });


});



// loading file pond js
FilePond.registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileEncode,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageResize
);

// Get a reference to the file input element
const inputElement = document.querySelector('input[type="file"]');

// Create the FilePond instance
const pond = FilePond.create(inputElement, {
  maxFileSize: "100MB"
});

FilePond.setOptions({
  stylePanelAspectRatio: 0.3
});

FilePond.parse(document.body);



