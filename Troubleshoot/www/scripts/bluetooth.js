var position = 0;
var address = "F4:AE:03:E8:D6:35";//"C3:10:D9:17:33:61"; //Address of old Nano device
var serviceUuid = "1815";//"713d0000-503e-4c75-ba94-3148f18d941e"; //Client - Generic Acess
var characteristics = "2A57"; //Generic Access - Device Name
var characteristicTemp = "2A59";
var charAccel = "2A58";

/******  MAIN MENU   ******/
function toTemp() {
    window.location.href = "temp.html";
   // tempGraph();
}
function toMusic() {
    window.location.href = "music.html";
}

/******  TEMP PAGE   ******/
var chart, sleepLine;
var currentTemp = 25;
var modalOpen = false;
var tempTime = 0;
var minTemp, maxTemp, avgTemp;
var tempArray = [];
function tempGraph() {
    chart = new CanvasJS.Chart("temp-graph", {
        title: {
            text: "Body Temperature",
            fontFamily: "calibri"
        },
        axisX: {
            //valueFormatString: "DD MMM"
            //minimum: 0,
            //interval: 1
        },
        axisY: {
            //title: "Body Temperature",
            fontFamily: "calibri",
            margin: 5,
            suffix: "°C",
            minimum: -1,
            maximum: 38
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
        },
        data: [
            /*{
                type: "spline",
          showInLegend: true,
                name: "Normal Temperature",
                dataPoints: [
                    { y: 37 },
                    { y:  37 },
                    { y: 37 },
                    { y:  37 }	
                ]
            },*/
            {
                type: "spline",
                showInLegend: true,
                name: "Recorded Temperature",
                dataPoints: [

                ]
            }
        ]
    });
    chart.render();
}

function addDataPoint() {
    //currentTemp = 24; //test! 
    //var ddpt = 37;
    //var length = chart.options.data[0].dataPoints.length;
    //chart.options.title.text = "New DataPoint Added at the end";
    //if (chart.data[0].get("name") === "Normal Temperature") {}
    chart.data[0].addTo("dataPoints", { y: currentTemp })
    //chart.options.data[0].dataPoints.push({ y: 37});
    //if (chart.data[0].get("name") === "Recorded Temperature")
    //chart.data[0].addTo("dataPoints2", {y: 40});
    chart.render();

}

/******  MUSIC PAGE  ******
var src = 'cdvfile://localhost/';
var media = new Media(src, mediaSuccess, mediaError);
function playMusic() {
    media.playMusic;
}
function mediaSuccess() {
    alert("success play");
}
function mediaError() {
    alert("error play");
}

/******  BLUETOOTH   ******/
function bluetooth() {

    new Promise(function (resolve) {

        bluetoothle.initialize(resolve, { request: true, statusReceiver: false });

    }).then(initializeSuccess, handleError);

}

function initializeSuccess(result) {

    if (result.status === "enabled") {

        //log("Bluetooth is enabled.");
        //log(result);
    }

    else {

        document.getElementById("start-scan").disabled = true;

        log("Bluetooth is not enabled:", "status");
        log(result, "status");
    }
}
function handleError(error) {
    var msg;

    if (error.error && error.message) {

        var errorItems = [];

        if (error.service) {

            errorItems.push("service: " + (uuids[error.service] || error.service));
        }

        if (error.characteristic) {

            errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
        }

        msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
    }

    else {

        msg = error;
    }

    //log(msg, "error");

    if (error.error === "read" && error.service && error.characteristic) {

        reportValue(error.service, error.characteristic, "Error: " + error.message);
    }
}
function log(msg, level) {

    level = level || "log";

    if (typeof msg === "object") {

        msg = JSON.stringify(msg, null, "  ");
    }

    //console.log(msg);

    if (level === "status" || level === "error") {

        var msgDiv = document.createElement("div");
        msgDiv.textContent = msg;

        if (level === "error") {

            msgDiv.style.color = "red";
        }

        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("output").appendChild(msgDiv);
    }
}


/***************************Connect**************************/
function connect() {
    //alert("entered connect fcn");
    new Promise(function (resolve, reject) {

        bluetoothle.connect(resolve, reject, { address: address });

    }).then(connectSuccess, handleError);
    //alert("finished connect fcn");
}

function connectSuccess(result) {
    if (result.status === "connected") {
        getDeviceServices(result.address);
        //alert("connected");
        $("#footer-msg").text("Connected");
        bleCt = 1;
    }
    else if (result.status === "disconnected") {
        //alert("Disconnected from device");
        $("#footer-msg").text("Disconnected");
        bleCt = 0;
        new Promise(function (resolve, reject) {

            bluetoothle.reconnect(resolve, reject, { address: address });

        }).then(connectSuccess, handleError);
    }
}

function getDeviceServices(address) {
    new Promise(function (resolve, reject) {

        bluetoothle.discover(resolve, reject,
            { address: address });

    }).then(discoverSuccess, handleError);
}

function discoverSuccess(result) { /////////////////////Android Platform
    if (result.status === "discovered") {

        // Create a chain of read promises so we don't try to read a property until we've finished
        // reading the previous property.

        var readSequence = result.services.reduce(function (sequence, service) {

            return sequence.then(function () {

                return addService();
            });

        }, Promise.resolve());

        // Once we're done reading all the values, disconnect
        /* readSequence.then(function () {
 
             new Promise(function (resolve, reject) {
 
                 bluetoothle.disconnect(resolve, reject,
                     { address: result.address });
 
             }).then(connectSuccess, handleError);
 
         } );*/
    }
}

/**************************Read/Write************************/
function readButton() {
    bluetoothle.read(readSuccessBtn, handleError, { address: address, service: serviceUuid, characteristic: characteristics });
}
function readTemp() {
    bluetoothle.read(readSuccessTemp, handleError, { address: address, service: serviceUuid, characteristic: characteristicTemp });
}
function readAccel() {
    bluetoothle.read(readSuccessAccel, handleError, { address: address, service: serviceUuid, characteristic: charAccel });
}
function readSuccessBtn(result) {
    //alert("in readSuccess");
    if (result.status === "read") {
        var bytes = bluetoothle.encodedStringToBytes(result.value);
        var btnState = bluetoothle.bytesToString(bytes);

        if (btnState === "p") { //pressed
            report();
            //pdfTest();
            //readTemp();//read temp
        }
    }
}
function readSuccessTemp(result) {
    if (result.status === "read") {
        var newTemp = bluetoothle.encodedStringToBytes(result.value);
        //alert(typeof currentTemp); //object
        newTemp = Number(newTemp);
        //alert(newTemp);
        if (newTemp !== 0 && Math.abs(newTemp - currentTemp) < 5) {
            currentTemp = newTemp; //update temp if not zero
        }
        /*** check too hot / too cold ***/
        if (currentTemp > 38 && !modalOpen) //38 for fever body temp. 27 used for testing
            alert("Time to cool down");
        else if (currentTemp < 15 && !modalOpen) //35 for body temp. 22 used for testing
            alert("Time to warm up");
        tempArray.push(currentTemp);
        //alert(typeof currentTemp); //number
        $("#current-temp").text(currentTemp + "˚C");
        addDataPoint();
    }
}
var accelX = [0];
var accelY = [0];
var accelZ = [0];
var sleepPos = [0, 0, 0, 0, 0];
var sleepCount = [0, 0, 0, 0, 0];
var sleeping = 0;
var sleepDuration = 0;
function readSuccessAccel(result) {
    if (result.status === "read") {
        var newAccel = bluetoothle.encodedStringToBytes(result.value);
        //alert(newAccel);
        var newAccelX = String(newAccel).substr(0, String(newAccel).indexOf(','));
        var newAccelY = String(newAccel).substr(String(newAccel).indexOf(',') + 1, String(newAccel).lastIndexOf(',') - String(newAccel).indexOf(',') - 1);
        var newAccelZ = String(newAccel).substr(String(newAccel).lastIndexOf(',') + 1);
        //alert("X: " + newAccelX + "\nY: " + newAccelY + "\nZ: " + newAccelZ);

        //shift array values and take average
        for (var i = 5; i > 0; i--) {
            accelX[i] = accelX[i - 1];
            accelY[i] = accelY[i - 1];
            accelZ[i] = accelZ[i - 1];
        }
        accelX[0] = Number(newAccelX); 
        accelY[0] = Number(newAccelY); 
        accelZ[0] = Number(newAccelZ); 
        
        if (tempTime > 4) { //array full of new values
            avgX = accelX.reduce((a, b) => a + b, 0) / accelX.length;
            avgY = accelY.reduce((a, b) => a + b, 0) / accelY.length;
            avgZ = accelZ.reduce((a, b) => a + b, 0) / accelZ.length;

            //Start sleep
            if (newAccelY > 20)
                sleeping = 1;
            //Tally up positions
            if (sleeping) {

                
                //alert(sleepDuration);
                if (newAccelY < 20) { // STANDING
                    //alert("standing");
                    sleepCount[0]++;
                    sleepDuration++;
                    //sleepPos[0] = (sleepCount[0] / sleepDuration) * 100;
                }
                else if (newAccelZ < 20) { // BACK OR FRONT
                    //alert("back or front");
                    if (avgZ < 20) {
                        //alert("back");
                        sleepCount[1]++;
                        sleepDuration++;
                        //sleepPos[1] = (sleepCount[1] / sleepDuration)*100;
                        //alert("Back: " + sleepPos[1]);
                    }
                    else {
                        //alert("front");
                        sleepCount[2]++;
                        sleepDuration++;
                        //sleepPos[2] = (sleepCount[2] / sleepDuration)*100;
                        //alert("Front: " + sleepPos[2]);
                    }
                }
                else if (newAccelX < 20) { // SIDE
                    //alert("side");
                    if (avgX < 20) {
                        //right side
                        sleepCount[3]++;
                        sleepDuration++;
                        //sleepPos[3] = (sleepCount[3] / sleepDuration)*100;
                    }
                    else {
                        //left side
                        sleepCount[4]++;
                        sleepDuration++;
                        //sleepPos[4] = (sleepCount[4] / sleepDuration)*100;
                    }

                }
                sleepPos[0] = (sleepCount[0] / sleepDuration) * 100;
                sleepPos[1] = (sleepCount[1] / sleepDuration) * 100;
                sleepPos[2] = (sleepCount[2] / sleepDuration) * 100;
                sleepPos[3] = (sleepCount[3] / sleepDuration) * 100;
                sleepPos[4] = (sleepCount[4] / sleepDuration) * 100;
                updateSleep();
            }
        }
        //alert(sleepPos[2]);
        //sleepLine.render();
        
    }
}

function addService() {
    var readSequence = Promise.resolve();
    //alert("indata");
    readSequence = readSequence.then(function () {
        return new Promise(function (resolve, reject) {

            bluetoothle.read(resolve, reject,
                { address: address, service: serviceUuid, characteristic: characteristics });

        }).then(readSuccess, handleError);

    });
    return readSequence;
}
function readSuccess(result) {
    //alert("in readSuccess");
    if (result.status === "read") {
        var bytes = bluetoothle.encodedStringToBytes(result.value);
        var btnState = bluetoothle.bytesToString(bytes);
    }
}

/**************************Report************************/
function openPanel() {
    $("#mypanel").show();
}
function report() {
    //Close Panel
    $("#mypanel").hide();

    var path = window.location.pathname;
    var page = path.split("/").pop();
    //alert(page);
    if (page === "index.html") {
        //alert("Home");
    }
    else if (page === "temp.html") {
        var modal = document.getElementById('modalTemp');
        if (modalOpen) {
            modal.style.display = "none";
            setTimeout(function () {
                modalOpen = false;
            }, 500);
        }
        else if (!modalOpen) {
            modal.style.display = "block";
            $("#tempReport-total-time").text(tempTime + " seconds");
            minTemp = Math.min(...tempArray);
            $("#tempReport-min-temp").text(minTemp + "\xB0C");
            maxTemp = Math.max(...tempArray);
            $("#tempReport-max-temp").text(maxTemp + "\xB0C");
            avgTemp = tempArray.reduce((a, b) => a + b, 0) / tempArray.length;
            avgTemp = avgTemp.toPrecision(2);
            $("#tempReport-avg-temp").text(avgTemp + "\xB0C");

            setTimeout(function () {
                modalOpen = true;
                //btnFcn();
            }, 500);  
        }
    }
    //$("#mypanel").show();
}
function closeModal() {
    var modal = document.getElementById('modalTemp');
    modal.style.display = "none";
    modalOpen = false;
    //$("#mypanel").show();
}

function bluetoothSeq() {
    //alert("Reconnecting...");
    bluetooth();
    connect();
}

/***********************************************  Sleep Monitor  ************************************************/
function sleepLineGraph() {
    /*sleepLine = new CanvasJS.Chart("sleep-graph", {
        title: {
            fontFamily: "calibri"
        },
        axisX: {
            interval: 1
        },
        axisY: {
            fontFamily: "calibri",
            margin: 5
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
        },
        data: [
            /*{
                type: "spline",
          showInLegend: true,
                name: "Normal Temperature",
                dataPoints: [
                    { y: 37 },
                    { y:  37 },
                    { y: 37 },
                    { y:  37 }	
                ]
            },*/
        /*    {
                type: "spline",
                showInLegend: true,
                name: "Recorded Temperature",
                dataPoints: [
                    { y: 1 }, { y: 2 }, { y: 3 }
                ]
            }
        ]
});*/
    sleepLine = new CanvasJS.Chart("sleep-graph", {
        animationEnabled: true,
        backgroundColor: "transparent",
        width: 356, //hardcoded
        title: {
            text: "Sleep Positions"
            //margin: 0
        },
        legend: {
            //horizontalAlign: "right"
            dockInsidePlotArea: true,
            itemWidth: 60 //hardcoded
        },
        data: [{
            type: "pie",
            showInLegend: true,
            yValueFormatString: "##0\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: [
               // { y: 100, label: "Standing", name: "Upright Position" },
                { y: sleepPos[2], label: "Front", name: "Front" },
                { y: sleepPos[1], label: "Back", name: "Back" },
                { y: sleepPos[4], label: "Left", name: "Left" },
                { y: sleepPos[3], label: "Right", name: "Right" }
            ]
        }]
    });

    sleepLine.render();
}
function updateSleep() {
    var length = sleepLine.options.data[0].dataPoints.length;
   // sleepLine.options.title.text = "Last DataPoint Updated";
    sleepLine.options.data[0].dataPoints[length - 4].y = sleepPos[2]; //front
    sleepLine.options.data[0].dataPoints[length - 3].y = sleepPos[1]; //back
    sleepLine.options.data[0].dataPoints[length - 2].y = sleepPos[4]; //left
    sleepLine.options.data[0].dataPoints[length - 1].y = sleepPos[3]; //right

    sleepLine.render();
}

/*USE AFTER GETTING NUMBER OUT OF 100, 100 BEING AWAKE, 0 BEING DEEP SLEEP
var yLabels = ["Deep","Light","Awake"];

var chart = new CanvasJS.Chart("chartContainer", {
	axisY: {
  interval: 50,
  	labelFormatter: function ( e ) {
      var yCats = yLabels[e.value/50];
      return yCats;
    }
  },
	data: [
	{
		type: "spline",
		dataPoints: [
			{ x: 10, y: 71 },
			{ x: 20, y: 55 },
			{ x: 30, y: 50 },
			{ x: 40, y: 65 },
			{ x: 50, y: 95 },
			{ x: 60, y: 68 },
			{ x: 70, y: 28 },
			{ x: 80, y: 34 },
			{ x: 90, y: 14 }
		]
	}
	]
});

chart.render();
*/

/*************************************************  General  **************************************************/
/***** Tabs*****/
function changeTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    //if (tabName === "sleep-tab")
        //sleepLineGraph();
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function defaultTab(evt, tabName) {
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    tempGraph();
    sleepLineGraph();
}

