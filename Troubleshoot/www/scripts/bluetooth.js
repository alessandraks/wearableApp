var position = 0;
var address = "C3:10:D9:17:33:61";//C3:10:D9:17:33:61 -- Address of old Nano device //F4:AE:03:E8:D6:35 -- Address of broken
var serviceUuid = "1815";//"713d0000-503e-4c75-ba94-3148f18d941e"; //Client - Generic Acess
var characteristics = "2A57"; //Generic Access - Device Name
var characteristicTemp = "2A59";
var charAccel = "2A58";

/******  MAIN MENU   ******/
function toTemp() {
    navigator.vibrate(2000);
    window.location.href = "temp.html";
    
   // tempGraph();
}
function toMusic() {
    navigator.vibrate(2000);
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
            dockInsidePlotArea: true
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
        if (currentTemp > 38 && !modalOpen) { //38 for fever body temp. 27 used for testing
            navigator.notification.beep(1);
            alert("Time to cool down");
        }
        else if (currentTemp < 15 && !modalOpen) { //35 for body temp. 22 used for testing
            navigator.notification.beep(1);
            alert("Time to warm up");
        }
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
var totalSleep = 0;
var lastPos = 0;  //standing 0, back 1, front 2, right 3, left 4
var posCtr = 0;
//var posFlags = [0, 0, 0, 0, 0]; //back 1, front 2, right 3, left 4
var toFront = 0;
var toLeft = 0;
var frontFlag = 0;
var rightFlag = 0;
var posChange = 0;
var sleepHr, sleepMin;
var rssiFront, rssiCurr;
function readSuccessAccel(result) {
    if (result.status === "read") {
        var newAccel = bluetoothle.encodedStringToBytes(result.value);
        //alert(newAccel);
        var newAccelX = String(newAccel).substr(0, String(newAccel).indexOf(','));
        var newAccelY = String(newAccel).substr(String(newAccel).indexOf(',') + 1, String(newAccel).lastIndexOf(',') - String(newAccel).indexOf(',') - 1);
        var newAccelZ = String(newAccel).substr(String(newAccel).lastIndexOf(',') + 1);
        //alert("X: " + newAccelX + "\nY: " + newAccelY + "\nZ: " + newAccelZ);

        //compare < or > . if 4/5 values are >, and on back/front, turning to left. if ... . 

        //shift array values and take average
        for (var i = 5; i > 0; i--) {
            accelX[i] = accelX[i - 1];
            accelY[i] = accelY[i - 1];
            accelZ[i] = accelZ[i - 1];
        }
        accelX[0] = Number(newAccelX); 
        accelY[0] = Number(newAccelY); 
        accelZ[0] = Number(newAccelZ); 
        
        if (tempTime > 2) { //array full of new values
            /*avgX = accelX.reduce((a, b) => a + b, 0) / accelX.length;
            avgY = accelY.reduce((a, b) => a + b, 0) / accelY.length;
            avgZ = accelZ.reduce((a, b) => a + b, 0) / accelZ.length;*/

            /*if (avgZ > 190) 
                frontFlag = 1;*/

            //notes: need to check if changing position, then perform checks

            //testing
           /* for (var j = 4; j > 0; j--) {
                if (accelZ[j] > 200)
                    frontFlag = 1;
                else if (accelX[j] > 200)
                    rightFlag = 1;
            }*/

            /*if (lastPos === 1 || lastPos === 2) { //changing position from back/front to left/right
                for (var j = 5; j > 0; j--) { //check last 5 values and check if increasing or decreasing
                    if (Math.abs(accelX[3] - accelX[j - 1]) > 20 && Math.abs(accelX[3] - accelX[j - 1]) < 200) { //don't count the edge values
                        if (accelX[0] > accelX[j]) { //increasing from back/front to left
                            toLeft++;
                        }
                        else { //decreasing from back/front to right
                            toLeft--;
                        }
                        posChange = 1;
                    }
                }
                if (posChange) {
                    //alert(toLeft);
                    if (toLeft > 0) { //left
                        rightFlag = 0;
                    }
                    else { //right
                        rightFlag = 1;
                    }
                    toLeft = 0;
                    posChange = 0;
                }
            }*/
           /* else if (lastPos === 3 || lastPos === 4) { //changing position from left/right to back/front
                for (var j = 5; j > 0; j--) { //check last 5 values and check if increasing or decreasing
                    if (Math.abs(accelZ[3] - accelZ[j - 1]) > 20 && Math.abs(accelZ[3] - accelZ[j - 1]) < 200) { //don't count the edge values
                        if (accelZ[0] > accelZ[j]) { //increasing from back/front to left
                            toFront++;
                        }
                        else { //decreasing from back/front to right
                            toFront--;
                        }
                        posChange = 1;
                    }
                }
                if (posChange) {
                    if (toFront > 0) { //front
                        frontFlag = 1;
                    }
                    else { //back
                        frontFlag = 0;
                    }
                    toFront = 0;
                    posChange = 0;
                }
            }*/

            //Start sleep
            if (newAccelY < 70) //batt-test: newAccelY > 20
                sleeping = 1;
            //Tally up positions
            if (sleeping) { 
                
                /*batt-test:  if (rssiInitial) { //read RSSI value for front
                    getRSSI();
                }
                getRSSI();*/

                totalSleep++;
                
                if (newAccelY < 20) { // STANDING (0) //batt-test: newAccelY < 20
                    lastPos = 0;
                    sleeping = 0;
                }
                else if (newAccelZ > 144 && newAccelZ < 170) { //front
                    sleepDuration++;
                    sleepCount[2]++;
                    lastPos = 2;
                }
                else if (newAccelZ > 176 && newAccelZ < 223) { //back
                    sleepDuration++;
                    sleepCount[1]++;
                    lastPos = 1;
                }
                else if (newAccelX > 128 && newAccelX < 175) { //left
                    sleepDuration++;
                    sleepCount[4]++;
                    lastPos = 4;
                }
                else if (newAccelX > 176 && newAccelX < 208) { //right
                    sleepDuration++;
                    sleepCount[3]++;
                    lastPos = 3;
                }
                else {
                    //sleepCount[sleepPos]++;
                }
                sleepPos[0] = (sleepCount[0] / sleepDuration) * 100;
                sleepPos[1] = (sleepCount[1] / sleepDuration) * 100;
                sleepPos[2] = (sleepCount[2] / sleepDuration) * 100;
                sleepPos[3] = (sleepCount[3] / sleepDuration) * 100;
                sleepPos[4] = (sleepCount[4] / sleepDuration) * 100;
                sleepHr = totalSleep / 3600;
                sleepMin = (totalSleep / 60) % 60;
                $("#current-duration").text(sleepHr.toFixed(0) + "hr " + sleepMin.toFixed(0) + "min");
                updateSleep();
            }
        }
        
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
            avgTemp = avgTemp.toFixed(0);
            $("#tempReport-avg-temp").text(avgTemp + "\xB0C");

            setTimeout(function () {
                modalOpen = true;
                //btnFcn();
            }, 500);  
        }
    }
    //$("#mypanel").show();
}
function sleepReport() {
    var modal = document.getElementById('modalSleep');
    if (modalOpen) {
        modal.style.display = "none";
        setTimeout(function () {
            modalOpen = false;
        }, 500);
    }
    else if (!modalOpen) {
        modal.style.display = "block";
        $("#sleepReport-duration").text(sleepHr.toFixed(0) + "hr " + sleepMin.toFixed(0) + "min");
        $("#sleepReport-front").text(sleepPos[2].toFixed(0) + " %");
        $("#sleepReport-back").text(sleepPos[1].toFixed(0) + " %");
        $("#sleepReport-left").text(sleepPos[4].toFixed(0) + " %");
        $("#sleepReport-right").text(sleepPos[3].toFixed(0) + " %");

        setTimeout(function () {
            modalOpen = true;
        }, 500);
    }
}
function closeModal(page) {
    var modal;
    if(page === 'temp')
        modal = document.getElementById('modalTemp');
    else if (page === 'sleep')
        modal = document.getElementById('modalSleep');
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
var tabPage = 'temp';
function changeTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === "sleep-tab")
        tabPage = 'sleep';
    else if (tabName === "temp-tab")
        tabPage = 'temp';
}

function defaultTab(evt, tabName) {
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    tempGraph();
    sleepLineGraph();
}



/*RSSI testing*/
function getRSSI() {
    bluetoothle.rssi(rssiSuccess, rssiError, { address: address });
}

var rssiCtr = 0;
var rssiInitial = 1;
var rssiArray = [0,0,0];
function rssiSuccess(result) {
    if (result.status === "rssi") {
        /*rssivals = rssivals + ", " + String(result.rssi);
        rssictr++;
        if (rssictr === 120) {
            console.log("rssi values" + rssivals);
            
        }*/
        if (rssiInitial) {
            rssiFront = Number(String(result.rssi)); //should get avg
            rssiInitial = 0;
        }
        else {
            for (var k = 2; k > 0; k--) {
                rssiArray[k] = rssiArray[k - 1];
                rssiCtr++;
            }
            rssiArray[0] = Number(String(result.rssi));
            if (rssiCtr > 5) { //array is full of all new values
                rssiCurr = rssiArray.reduce((a, b) => a + b, 0) / rssiArray.length; //average
            }
            else if (rssiCtr === 4) { //last two indices in array contain new values
                rssiCurr = rssiArray.reduce((a, b) => a + b, -1) / (rssiArray.length - 1); //average
            }
            else { //array only has one new value at index 0
                rssiCurr = rssiArray[0];
            }
        }
    }
    else
        console.log("rssi status not read correctly");
}
function rssiError() {
    console.log("rssi error");
}
