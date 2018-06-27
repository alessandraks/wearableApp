// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
        bluetooth();
        connect();

        $("#home-btn-temp").click(toTemp);
        $("#home-btn-music").click(toMusic);
        $("#footer-msg").click(bluetoothSeq);
        $("#pdf-btn").click(btnFcn);
        $("#sleep-pdf-btn").click(btnFcn);
        $("#excel-btn").click(excelMaker);
        $("#sleep-excel-btn").click(excelMaker);
        $("#panel-btn").click(openPanel);
       // $("#report-btn").click(report);

        var path = window.location.pathname;
        var page = path.split("/").pop();

        if (page === "temp.html") {
            window.setInterval(function () {
                readTemp();
                tempTime++;
                readAccel();
            }, 1000); //every second
        }
        window.setInterval(function () {
            readButton();
        }, 100); //every 0.1 seconds
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();