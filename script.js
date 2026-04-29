const units = {
    length: {
        m: 1,
        km: 1000,
        cm: 0.01
    },
    weight: {
        kg: 1,
        g: 0.001,
        lb: 0.453592
    },
    speed: {
        "m/s": 1,
        "km/h": 0.277778
    }
};

// Temperature handled separately
function convertTemperature(value, from, to) {
    if (from === to) return value;

    // Convert to Celsius first
    if (from === "F") value = (value - 32) * 5/9;
    if (from === "K") value = value - 273.15;

    // Convert from Celsius to target
    if (to === "F") return (value * 9/5) + 32;
    if (to === "K") return value + 273.15;

    return value;
}

const categorySelect = document.getElementById("category");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");

function loadUnits() {
    let category = categorySelect.value;

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    let options;

    if (category === "temperature") {
        options = ["C", "F", "K"];
        document.getElementById("converterSection").style.display = "block";
        document.getElementById("currencySection").style.display = "none";
    } else if (category === "currency") {
        // For currency, we'll use separate selects
        document.getElementById("converterSection").style.display = "none";
        document.getElementById("currencySection").style.display = "block";
        return;
    } else {
        options = Object.keys(units[category]);
        document.getElementById("converterSection").style.display = "block";
        document.getElementById("currencySection").style.display = "none";
    }

    options.forEach(unit => {
        fromUnit.innerHTML += `<option>${unit}</option>`;
        toUnit.innerHTML += `<option>${unit}</option>`;
    });
}

categorySelect.addEventListener("change", loadUnits);

function convert() {
    let category = categorySelect.value;
    let value = parseFloat(document.getElementById("inputValue").value);

    if (isNaN(value)) {
        alert("Enter a valid number");
        return;
    }

    let result;
    let from, to;

    if (category === "currency") {
        from = document.getElementById("fromCurrency").value;
        to = document.getElementById("toCurrency").value;
        convertCurrency(value, from, to).then(res => {
            result = res;
            document.getElementById("result").innerText = 
                `Result: ${result.toFixed(2)} ${to}`;
            saveHistory(`${value} ${from} → ${result.toFixed(2)} ${to}`);
        });
        return;
    } else if (category === "temperature") {
        from = fromUnit.value;
        to = toUnit.value;
        result = convertTemperature(value, from, to);
    } else {
        from = fromUnit.value;
        to = toUnit.value;
        let base = value * units[category][from];
        result = base / units[category][to];
    }

    document.getElementById("result").innerText = 
        `Result: ${result.toFixed(4)} ${to}`;
    saveHistory(`${value} ${from} → ${result.toFixed(2)} ${to}`);
}

async function convertCurrency(amount, from, to) {
    let url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    let res = await fetch(url);
    let data = await res.json();

    let rate = data.rates[to];
    return amount * rate;
}

function saveHistory(text) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(text);
    localStorage.setItem("history", JSON.stringify(history));
    showHistory();
}


function showHistory() {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    let list = document.getElementById("history");
    list.innerHTML = "";

    history.forEach(item => {
        list.innerHTML += `<li>${item}</li>`;
    });
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}
function startVoice() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
        document.getElementById("inputValue").value = text;
    };

    recognition.start();
}

// Initial load
loadUnits();