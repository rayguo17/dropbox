let cacheFiles = [];

$(function () {
    getCacheFileList();
    getSaveFileList();
    $('#Submit').on('click', function (e) {
        console.log('onclick')
        let fileReader = document.querySelector('input[name="fileUploader"]');
        let file = fileReader.files[0];
        // let reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = (e) => {
        //     console.log(e.target.result)
        //     let result = e.target.result;
        //     let fileName = file.name;
            
        //     $.post('/uploader', {
        //         data: result,
        //         name:fileName,
        //     }).done(function (data) {
        //         console.log('success');
        //     }).fail(function (data) {
        //         console.log('fail')
        //     }).always(function (data) {
        //         console.log('running')
        //     })

           
        //     $.ajax({
        //         url: '/uploader',
        //         method: "POST",
        //         data: { data:result,name:fileName },
        //         contentType: "application/x-www-form-urlencoded",
        //         dataType: 'html',
        //         success: function (res) {
        //             console.log('sucess', res);
        //             $('#haha').append($(res));
        //         },
        //         error: function (msg) {
        //             console.log('error')
        //         }
        //     })
        // }
        //xmlHttprequest
        let formData = new FormData();
        formData.append("myfile", file);
        formData.append("name", file.name);

        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', '/url', true);
        // xhr.send(formData);
        // //xhr.responseType = 'document'
        // //xhr.overrideMimeType('text/xml')
        // xhr.onload= function () {
        //     var w = window.open('about:blank', 'windowname');
        //     console.log(xhr.response)
        //     w.document.write(xhr.response);
        //     w.document.close();
        // }

        //ajax
        console.log('ajax')
        $.ajax({
            url: '/url',
            data: formData,
            type: 'POST',
            contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
            processData: false, // NEEDED, DON'T OMIT THIS
            // ... Other options like success and etc
            success: function (res) {
                console.log('success', res);
                getCacheFileList();
                getSaveFileList();
                //$('#haha').append($(res));
            },
            error: function (err) {
                alert('file exist!')
                console.log('error',err);
            }
        });
    })
    $('#download').on('click', function (e) {
        e.preventDefault();
        console.log('download');
        let fileName = $('#formDownload input[type="text"]').val();
        // $.ajax({
        //     url: `/search/${fileName}`,
        //     type: 'GET',
        //     success: function (response) {
        //         console.log('sucess',  response);
        //         // let a = document.createElement('a');
        //         // let bytes = new Uint8Array(response.length);
        //         // for (let i = 0; i < response.length; i++){
        //         //     bytes[i] = response.charCodeAt(i);
        //         // }
        //         // let blob = new Blob(bytes,{type:"image/jpeg"});
        //         // let url = window.URL.createObjectURL(blob);
        //         // a.onload = function () {
        //         //     window.URL.revokeObjectURL(url);
        //         // }
        //         // a.href = url;
        //         // a.download = fileName;
        //         // a.click();
        //     }
        // })
        
        const link = document.createElement('a');
        link.href = `/search/${fileName}`;
        link.download = fileName;
        link.click();
        console.log(fileName);
    })
})

function getCacheFileList() {
    $.ajax({
        url: '/getCache',
        type: 'GET',
        success: function (response) {
            console.log('getCache sucess!', response);
            let cacheArray = JSON.parse(response);
            cacheFiles = cacheArray;
            console.log(typeof cacheArray);
            $('#cacheList').html("");
            for (let i = 0; i < cacheArray.length; i++){
                console.log('creating a tag')
                let a = document.createElement('a');
                a.href = `/search/${cacheArray[i]}`;
                a.download = cacheArray[i];
                a.innerHTML = cacheArray[i];
                let li = $('<li>').append($(a));
                $('#cacheList').append(li);
                
                
            }
        }
    })
}
function getSaveFileList() {
    $.ajax({
        url: '/getFiles',
        type: 'GET',
        success: function (response) {
            console.log('get Saved Files sucess!', response);
            let filesArray = JSON.parse(response);
            $('#savedList').html("");
            for (let i = 0; i < filesArray.length; i++){
                console.log('creating Saved files list');
                let a = document.createElement('a');
                a.href = `/search/${filesArray[i]}`;
                a.download = filesArray[i];
                a.innerHTML = filesArray[i];
                let li = $('<li>').append($(a));
                $('#savedList').append(li);
            }
        }
    })
}