# dropbox
This is a bootcamp assignment to implement dropbox application useing node.js & express & fs module.
User can upload/download files, in backend we have a cache concept, for the most frequently access files or most recent uploaded file, we put it into cache, so when user want to 
download it we don't have to read file, instead we already store the data buffer as a variable in our backend, and we can just send the data directly.
