var express = require('express');
var multer = require('multer');
var path = require('path');
var fileUpload = require('express-fileupload');
const helpers = require('./helpers');
var fs = require('fs');


var app = express();
let cache = {};
let cacheList = [];
let savedList = [];

function writeFile(dir,file) {
    return new Promise((resolve, rejects) => {
        buffer = file.buffer
        fs.writeFile(dir, buffer, function (err) {
            if (err) {
                rejects('cannot write file',err)
            } else {
                resolve({dir:dir,type:file.mimetype});
            }
        })
    }).then(readFile)
}

function readFile(message) {
    return new Promise((resolve, rejects) => {
        let dir = message.dir;
        fs.readFile(dir, function (err, data) {
            if (err) {
                rejects(err);
            } else {
                resolve({data:data,type:message.type});
            }
        })
    })
}

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
//app.use(fileUpload());
app.use(express.urlencoded({extended:false,limit:'50mb'}))

const storage = multer.diskStorage({
    destination: './public/uploads/images',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

app.post('/upload-profile-pic', (req, res) => {
    
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('profile_pic');
    upload(req, res, function (err) {
        console.log(req.file)
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        console.log(req.file.path.slice(7));
        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${req.file.path.slice(7)}" width="500"><hr /><a href="./">Upload another image</a>`);
        
        
    })
    
})

app.post('/upload-multiple-images', (req, res) => {
    console.log(req.files);
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('multiple_images', 10);
    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }else if (req.files.length==0) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        console.log(req.files);
        let result = "You have uploaded these images: <hr/>";
        let files = req.files;
        let index, len;
        for (index = 0, len = files.length; index < len; index++){
            result+=`<img src="${files[index].path.slice(7)}" width="300" style="margin-right:200px;">`
        }
            result += '<hr/><a href="./">Upload more images</a>';
            console.log('result',result);
        res.send(result);
        
        
    })
})
// function decodeBase64Image(dataString) {
//     var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
//     response = {};

//   if (matches.length !== 3) {
//     return new Error('Invalid input string');
//   }

//   response.type = matches[1];
//   response.data = new Buffer(matches[2], 'base64');

//   return response;
// }
app.post('/uploader', function (req, res) {
    //console.log(req.body);
    let name = req.body.name;
    let data = req.body.data;
    let base64File = data.replace(/^data:image\/\w+;base64,/, '')
    fs.writeFile(`./public/uploads/images/${name}`, base64File, { encoding: 'base64' }, function (err) {
        if (err) {
            //res.sendStatus(404);
            res.end('error ocurr')
        } else {
            console.log('done');
            //res.sendStatus(200);
            res.send(` <hr/><img src="./uploads/images/${name}" width="500"><hr /><a href="./">Upload another image</a>`);
            //res.end();
        }
        //console.log(err);
    })
    //res.end('');
    //var form = new formidable
})
var handleUrl = multer();
app.post('/url',handleUrl.any(), function (req, res) {
    console.log('files',req.files)
    let fileName = req.files[0].originalname;
    if (savedList.includes(fileName)) {
        res.sendStatus(400);
        //res.send('file exist');
        return;
    }
    
    if (cacheList.length >= 3) {
        let deleteFile = checkFile();
        deleteInBothArray(deleteFile);
    } 
    cacheList.push({name:fileName,storeTime:Date.now(),times:0})
    cache[fileName] = writeFile(`./public/uploads/images/${fileName}`, req.files[0]);
    cache[fileName].then((body) => {
        //console.log('write File', cache[fileName]);
        console.log('AFTER write Read',body)
        res.send('file uploaded');
    }).catch((err) => {
        res.send(err);
    })
    
    // fs.writeFile(`./public/uploads/images/${req.files[0].originalname}`, req.files[0].buffer, function (err) {
    //     if (err) {
    //         res.end('error ocurr');
    //     } else {
    //         cacheFiles.push(req.files[0]);
    //         console.log('done');
    //         console.log('cacheFiles', cacheFiles);
    //         res.send(` <hr/><img src="./uploads/images/${req.files[0].originalname}" width="500"><hr /><a href="./">Upload another image</a>`);
    //     }
    // })
    
    
})
app.get('/search/:fileName', function (req, res) {
    //console.log('cache', cache);
    //console.log('search', req.params.fileName);
    //console.log(__dirname);

    let targetFile = req.params.fileName;
    //console.log(targetFile);
    
    if (typeof cache[targetFile] != 'undefined') {
        //console.log('getting file');
        cachePrior(targetFile);
        console.log('cache status after search', cacheList);
        console.log('next time delete', checkFile());
        console.log('cache files', cache);
        cache[targetFile].then((body) => {
            //console.log('sending file',body);

            res.setHeader("Content-Type",body.type)
            res.send(body.data);
        })
        
    } else {
        let dir = __dirname + '/public/uploads/images/' + targetFile;
        console.log('not available in cache', dir);
        res.download(__dirname + '/public/uploads/images/' + targetFile);
    }
    // fs.readdir(__dirname + '/public/uploads/images', function (err, files) {
    //     //console.log(files);
    //     let i = 0;
    //     for (file of files) {
    //         i++;
    //         console.log('times:',i,file)
    //         if (file == targetFile) {
    //             console.log('found!',file)
    //             // fs.readFile(__dirname + '/public/uploads/images/' + file, function (err, data) {
    //             //     res.attachment(file);
    //             //     res.send(data);
    //             // })
    //             res.download(__dirname + '/public/uploads/images/' + file);
    //             console.log('file sent')
    //         }
    //     }
    // })
})
app.get('/getCache', function (req, res) {
   // console.log(Object.keys(cache));
    res.send(JSON.stringify(Object.keys(cache)));
})
app.get('/getFiles', function (req, res) {
    fs.readdir(__dirname + '/public/uploads/images', function (err, files) {
        //console.log(files);
        savedList = files;
        res.send(JSON.stringify(files));
    })
})

app.listen(port, () => console.log(`Listening on port ${port}...`))


function cachePrior(fileName) {
    for (let i = 0; i < cacheList.length; i++){
        if (cacheList[i].name == fileName) {
            cacheList[i].times++;
        }
    }
}
function checkFile() {
    if (cacheList.length == 0) return 'empty';
    let least_time_array = cacheList.reduce((acc, cur) => {
        if (cur.times < acc.times ) {
            return cur;
        }
        if (cur.times == acc.times) {
            if (cur.storeTime < acc.storeTime) {
                return cur;
            } else {
                return acc;
            }
        }
        if (cur.times > acc.times) {
            return acc;
        }
    })
    return least_time_array.name;
}
function deleteInBothArray(name) {
    delete cache[name];
    cacheList = cacheList.filter(i => {
        if (i.name == name) {
            return false;
        } else {
            return true;
        }
    })
}