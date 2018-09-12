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

        var path = window.location.pathname;
        var page = path.split("/").pop();

        if(page === "index.html")
            toHome();

        $("#home-btn-temp").click(toTemp);
        $("#home-btn-music").click(toMusic);
        $("#home-btn-dyn").click(toDyn);
        //$("#home-btn").click(toHome);
        $("#footer-msg").click(bluetoothSeq);
        $("#pdf-btn").click(btnFcn);
        $("#sleep-pdf-btn").click(btnFcn);
        $("#dyn-pdf-btn").click(btnFcn);
        $("#excel-btn").click(excelMaker);
        $("#sleep-excel-btn").click(excelMaker);
        $("#dyn-excel-btn").click(excelMaker);
        $("#panel-btn").click(openPanel);
        $("#sleep-panel-btn").click(openPanel);
        $("#dyn-panel-btn").click(openPanel);
        $("#posture-notif").click(closeNotif);
        
       // $("#report-btn").click(report);
        
        if (page === "temp.html") {
            window.setInterval(function () {
                readTemp();
                tempTime++;
            }, 1000); //every second
        }
        window.setInterval(function () {
            //getRSSI();
            readAccel();

            bluetoothle.isConnected(connectCheck, handleError, { address: address });

        }, 200); //every 0.2 seconds
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();
