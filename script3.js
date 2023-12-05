const audio = new Audio("1.mp3");
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let playing="false";
let alarms = getAlarmsFromLocalStorage(); // Load alarms from local storage
console.log(alarms);

const setAlarm = document.getElementById("set");
const hr = document.getElementById("hr");
const min = document.getElementById("min");
const sec = document.getElementById("sec");
const newAlarm = document.querySelector(".alarms");
const am = document.getElementById("duration");
const curr = document.getElementById("curr");
const stop = document.getElementById("stop");


// initializing Alarms function
function initializeAlarms() {
    const storedAlarms = getAlarmsFromLocalStorage();
    if (Object.keys(storedAlarms).length > 0) {
        alarms = storedAlarms;
           for (const alarmId in alarms) {
            const alarmData = alarms[alarmId];
            const {newElement,content} = createAlarmElement(alarmId, alarmData);
            newAlarm.appendChild(newElement);
            newAlarm.appendChild(content);
        }
    }
}
// Calling the function when the page loads
initializeAlarms();



// function running after every sec to check for alarm 
setInterval(() => {
    const currentTime = new Date();
    const currentDay = currentTime.getDay();//returns in format of number
    const currentday = days[currentDay];
    const currentHour = formatTime(currentTime.getHours());
    const currentMinute = formatTime(currentTime.getMinutes());
    const currentSecond = formatTime(currentTime.getSeconds());
    const now = `${currentHour}:${currentMinute}:${currentSecond}`;
    
    curr.innerHTML = `<span class="bold-red">${currentHour}:${currentMinute}:${currentSecond}</span>`;
     const alarmElements = Array.from(document.querySelectorAll(".myalarm"));
      alarmElements.forEach(alarmElement => {
        const alarmId = alarmElement.getAttribute("data-id");
 if (alarms[alarmId] && alarms[alarmId].times.includes(now) && (alarms[alarmId].days.includes(currentday)||(alarms[alarmId].days==""))) {
            audio.play();
            playing="true";
        }
    });
}, 1000);



// adding event listener in setAlarm button
setAlarm.addEventListener("click", () => {
    const hr1 = formatTime(hr.value);
    const min1 = formatTime(min.value);
    const sec1 = formatTime(sec.value);

    if (validate(hr1, min1, sec1)) {
        const alarmId = new Date().getTime();
        const times = [`${hr1}:${min1}:${sec1}`];
        const days = [];
        const msg = ["add a msg"];
        alarms[alarmId] = { times, days, msg };
         // Create the new alarm element and append it to the UI
         const {newElement,content} = createAlarmElement(alarmId, alarms[alarmId]);
         newAlarm.appendChild(newElement);
         newAlarm.appendChild(content);

        saveAlarmsToLocalStorage();
         // Clearing input values
         hr.value = "";
         min.value = "";
         sec.value = "";
    } else {
        alert("Any field cannot be empty Or enter a value which is a valid time");
    }
});


// to stop the alarm
stop.addEventListener("click", () => {
    if (playing==="true") {
        audio.pause();
        playing="false";
       alert("Alarm stopped");
    }
});

// formats the time
function formatTime(time) {
    const timeString = time.toString();
    const numberOfDigits = timeString.length;
    return ( time < 10 && numberOfDigits===1 )? "0" + time : time;
}


// delete function to delete alarm
function deletetime() {
    const parentDiv = this.parentNode;
    const sibling = parentDiv.nextSibling;

    if (sibling.style.display === "flex") {
        sibling.style.display = "none";
    }

    // Get the alarmId from the data-id attribute
    const alarmId = parentDiv.getAttribute("data-id");
   // Removing the alarm from the alarms object
    delete alarms[alarmId];

    updateUI();
    saveAlarmsToLocalStorage();
    parentDiv.remove();
}


// function to validate day
function validateDay(alarmId, day) {
    return alarms[alarmId].days.length === 0 || alarms[alarmId].days.includes(day);
}
// validate function
function validate(hr, min, sec) {
    if (hr !== "" && 0 <= hr && hr <= 23 && min !== "" && 0 <= min && min < 60 && sec !== "" && 0 <= sec && sec < 60) {
        return true;
    } else {
        return false;
    }
}

// Save the alarms object to local storage
function saveAlarmsToLocalStorage() {
    localStorage.setItem("alarms", JSON.stringify(alarms));
}

// Retrieve the alarms object from local storage
function getAlarmsFromLocalStorage() {
    const storedAlarms = localStorage.getItem("alarms");
    return storedAlarms ? JSON.parse(storedAlarms) : {};
}

// Function to update the UI with the current state of alarms
function updateUI() {
    newAlarm.innerHTML = ""; // Clear the UI

    for (const alarmId in alarms) {
        const alarmData = alarms[alarmId];
        const {newElement,content} = createAlarmElement(alarmId, alarmData);
        newAlarm.appendChild(newElement);
        newAlarm.appendChild(content);
    }
}


// Function to create a new alarm element
function createAlarmElement(alarmId, alarmData) {
    const newElement = document.createElement("div");
    newElement.classList.add("myalarm");
    newElement.setAttribute("data-id", alarmId);
    newElement.innerHTML = alarmData.times[0];

    const more = document.createElement("button");
    more.classList.add("collapsible");
    more.textContent = "+";

    const content = document.createElement("div");
    content.classList.add("content");

    days.forEach((da) => {
        const daye = document.createElement("div");
        daye.classList.add("day");
        daye.textContent = da;
        if (alarmData.days.includes(da)) {
            daye.classList.add("darkgreen");
        }
            daye.addEventListener("click", () => {
            daye.classList.toggle("darkgreen");
             if (daye.classList.contains("darkgreen")) {
                alarms[alarmId].days.push(daye.textContent);
            } else {
                const index = alarms[alarmId].days.indexOf(daye.textContent);
                if (index !== -1) {
                    alarms[alarmId].days.splice(index, 1);
                }
            }
          // Save the updated alarms object to local storage
            saveAlarmsToLocalStorage();
        });
        content.appendChild(daye);
    });
        more.addEventListener("click", function () {
        this.classList.toggle("active");

        if (content.style.display === "flex") {
            content.style.display = "none";
        } else {
            content.style.display = "flex";
        }
    });
    const msg = document.createElement("div");
    msg.classList.add("msg");
    msg.textContent = alarmData.msg[0];

    msg.addEventListener("click", () => {
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = "";
        editInput.classList.add("edit-input");
         msg.innerHTML = "";
        msg.appendChild(editInput);

        editInput.focus();
        editInput.addEventListener("blur", () => {
            msg.textContent = editInput.value;
            alarms[alarmId].msg[0] = msg.textContent;
            saveAlarmsToLocalStorage();
        });

        editInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                msg.textContent = editInput.value;
                alarms[alarmId].msg[0] = msg.textContent;
                saveAlarmsToLocalStorage();
            }
        });
    });

    const dele = document.createElement("button");
    dele.classList.add("del");
    dele.textContent = "Delete";

    dele.addEventListener("click", deletetime);
    newElement.appendChild(msg);
    newElement.appendChild(more);
    newElement.appendChild(dele);
   
    return { newElement, content };
}

