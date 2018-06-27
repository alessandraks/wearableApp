var pdfOutput, csvOutput, sleepPDF, sleepCSV;
/****************************** PDF ******************************/
function btnFcn() {
    alert("Downloading...");
    var pdf = new jsPDF();
    if (tabPage === 'temp')
        source = $('#modalTemp')[0];
    else if (tabPage === 'sleep')
        source = $('#modalSleep')[0];
    specialElementHandlers = {
        '#pdf-btn': function (element, renderer) {
            return true
        },
        '#excel-btn': function (element, renderer) {
            return true
        }, 
        '#sleep-pdf-btn': function (element, renderer) { 
            return true
        },
        '#sleep-excel-btn': function (element, renderer) {
            return true
        }
    };
    margins = {
        top: 10,
        bottom: 60,
        left: 10,
        width: 522
    };
    pdf.fromHTML(
        source,
        margins.left,
        margins.top, {
            'width': margins.width,
            'elementHandlers': specialElementHandlers
        },
        function (dispose) {
            // dispose: object with X, Y of the last line add to the PDF 
            //          this allow the insertion of new lines after html
            //pdf.save('test.pdf');

        },
        margins);
    if (tabPage === 'temp')
        pdfOutput = pdf.output("blob");
    else if (tabPage === 'sleep')
        sleepPDF = pdf.output("blob");

    //Request storage
    window.requestFileSystem(PERSISTENT, 0, createDirectoryFS, failureInGettingFile);
}
function createDirectoryFS(fileSystem) {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (entry) {
        entry.getDirectory("Reports", { create: true, exclusive: false }, localStorageGetFS, failureInGettingFile);
    });
};
function failureInGettingFile(error) {};
function localStorageGetFS(dirEntry) {
    var today = new Date();
    var hr = today.getHours();
    var min = today.getMinutes();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) { dd = "0" + dd; }
    if (mm < 10) { mm = "0" + mm; }
    if (hr < 10) { hr = "0" + hr; }
    if (min < 10) { min = "0" + min; }

    if (tabPage === 'temp')
        var name = "TEMP_" + dd + mm + yyyy + "_" + hr + min;
    else if (tabPage === 'sleep')
        var name = "SLEEP_" + dd + mm + yyyy + "_" + hr + min;

    dirEntry.getFile(name + ".pdf", { create: true, exclusive: false }, function (fileEntry) {
        writeFile(fileEntry, null);
    }, failureInGettingFile);
};

function writeFile(fileEntry, dataObj) {
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            alert("Report Downloaded!");
        };
        fileWriter.onerror = function (e) {
        };
        if (!dataObj) {
            if (tabPage === 'temp')
                dataObj = new Blob([pdfOutput], { type: 'application/pdf' });
            else if (tabPage === 'sleep')
                dataObj = new Blob([sleepPDF], { type: 'application/pdf' });
        }

        fileWriter.write(dataObj);
    });
}

/****************************** EXCEL ******************************/
function excelMaker() {
    alert("Downloading...");
    csvOutput = "Total Time," + tempTime + "\n" + "Minimum Temperature," + minTemp + "\n" + "Maximum Temperature," + maxTemp + "\n" + "Average Temperature," + avgTemp + "\n";
    sleepCSV = "Sleep Duration," + sleepHr.toFixed(0) + "hr " + sleepMin.toFixed(0) + "min\n" + "Front," + sleepPos[2].toFixed(0) + "%\n" + "Back," + sleepPos[1].toFixed(0) + "%\n" + "Left," + sleepPos[4].toFixed(0) + "%\n" + "Right," + sleepPos[3].toFixed(0) + "%";
    window.requestFileSystem(PERSISTENT, 0, createDir, failureInGettingFile);
}
function createDir(fileSystem) {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (entry) {
        entry.getDirectory("Reports", { create: true, exclusive: false }, createFile, failureInGettingFile);
    });
}
function createFile(dirEntry) {
    var today = new Date();
    var hr = today.getHours();
    var min = today.getMinutes();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) { dd = "0" + dd; }
    if (mm < 10) { mm = "0" + mm; }
    if (hr < 10) { hr = "0" + hr; }
    if (min < 10) { min = "0" + min; }

    if (tabPage === 'temp')
        var name = "TEMP_" + dd + mm + yyyy + "_" + hr + min;
    else if (tabPage === 'sleep')
        var name = "SLEEP_" + dd + mm + yyyy + "_" + hr + min;

    dirEntry.getFile(name + ".csv", { create: true, exclusive: false }, function (fileEntry) {
        writeCSV(fileEntry, null);
    }, failureInGettingFile);
};
function writeCSV(fileEntry, dataObj) {
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            alert("Report Downloaded!");
        };
        fileWriter.onerror = function (e) {
        };
        if (!dataObj) {
            if (tabPage === 'temp')
                dataObj = new Blob([csvOutput], { type: 'text/plain' });
            else if (tabPage === 'sleep')
                dataObj = new Blob([sleepCSV], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}