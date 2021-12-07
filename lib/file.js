// file/directory helper functions

var skip = [".git"];
function listDir(directory)
{
    var files = filterDirectory(pruneSkips(Assets.list()), directory);
    return parseDirAndFiles(files);
}

function filterDirectory(fileList, directory)
{
    var output = [];
    var startPos = directory.length + 1;
    var directories = [];
    for (var i = 0; i < fileList.length; i++)
    {
        var pathSepPos = fileList[i].indexOf('/', startPos);
        if (pathSepPos == -1) pathSepPos = fileList[i].indexOf('\\', startPos);
        if (fileList[i].startsWith(directory)) {
            if (pathSepPos == -1) {
                output.push(fileList[i]);
            } else {
                var dirPath = fileList[i].substring(0, pathSepPos);
                if (directories.indexOf(dirPath) == -1) {
                    directories.push(dirPath);
                }
            }
        } 
    }
    output = output.concat(directories);
    return output;
}

function pruneSkips(fileList)
{
    var output = [];
    for (var i = 0; i < fileList.length; i++)
    {
        var ok = true;
        for (var j = 0; j < skip.length; j++)
        {
            if (fileList[i].startsWith(skip[j])) {
                ok = false;
                break;
            }
        }
        if (ok) {
            output.push(fileList[i]);
        }
    }
    return output;
}

function parseDirAndFiles(fileList)
{
    var directories = [];
    var files = [];
    for (var i = 0; i < fileList.length; i++)
    {
        if (isDir(fileList[i])) {
            directories.push(fileList[i]);
        } else {
            files.push(fileList[i]);
        }
    }
    return {
        directories: directories,
        files: files
    };
}

function isDir(path)
{
    var startIndex = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
    var periodIndex = path.lastIndexOf('.');
    if (periodIndex == -1) return true;
    return periodIndex < startIndex;
}