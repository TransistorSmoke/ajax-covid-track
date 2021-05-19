const container = document.querySelector('.container');
const stateConfig = {
    "states": {
        "Australian Capital Territory": "ACT",
        "New South Wales": "NSW",
        "Northern Territory": "NT",
        "Queensland": "QLD",
        "South Australia": "SA",
        "Tasmania": "TAS",
        "Victoria": "VIC",
        "Western Australia": "WA"        
    }
}

let allStates       = [];                   
let selectedStates  = [];
let stateData       = [];
// let stateAbbvs      = []                 // Unused for now

const request = new XMLHttpRequest();
const urlCountries = "https://api.covid19api.com/live/country/australia/status/confirmed"
const urlApi = "https://api.covid19api.com/summary";
request.open("GET", urlCountries, true);
request.send();


request.addEventListener("load", () => {
    const response = JSON.parse(request.responseText);
    const domSelectedStates = document.getElementsByClassName('selected');
    const domBtnStates = document.getElementsByClassName('state-btn');
   

    // Get unique AU state names (`Province` in the response data)
    response.forEach(el => {
        allStates.push(el.Province);
    });

    allStates = [... new Set(allStates)];    
    stateData = getAllStatesData(response, allStates, 5);

    displayStateButtons(allStates.sort(), stateConfig)

    const btnShowAll = document.querySelector('.show-all');
    const btnClearAll = document.querySelector('.clear-all');


    if (btnShowAll) {
        btnShowAll.addEventListener('click', function() {        
            displayStateData([], container, stateData); // Clear display data first
            displayStateData(allStates, container, stateData); 

            for (let x = 0; x < domBtnStates.length; x++) {
                if ( domBtnStates[x].classList.value.indexOf('-all') === -1) {
                    if (domBtnStates[x].classList.value.indexOf('selected') === -1) {
                        domBtnStates[x].classList.add('selected');
                    }
                }
            }
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener('click', function(e) {        
            if (domSelectedStates) {
                            
                while (domSelectedStates.length) {
                    domSelectedStates[0].classList.remove('selected')
                } 

                displayStateData([], container, stateData); 
            }
        });
    }

    // Display data for selected state, toggle background color of selected state
    document.addEventListener('click', function(e) {    
        const target = e.target;
        
        if (target.classList.value.indexOf('state-btn state-') > -1 ) {
            target.classList.toggle('selected');

            selectedStates = [];        
            for (let x = 0; x < domSelectedStates.length; x++ ) {
                selectedStates.push(domSelectedStates[x].textContent);
            }        
            displayStateData(selectedStates, container, stateData);     
        };
    });
});


// HELPER FUNCTIONS
// -------------------
// Get all states' data for X number of days up to 14 days
// If X days === null, limit data to 7 days worth.
// For this sample, we limit it to 4 days only for now.
function getAllStatesData(response, allStates, numDays = null) {
    let allStatesData = [];
    const daySpan = numDays ? numDays : 4;      // replace 4 with 7 later when using actual AJAX call
    
    allStates.forEach(state => {
        let dataEndIndex = response.length - 1;
        let counter = 0;
       
        for (dataEndIndex; counter < daySpan; dataEndIndex--) {    
            if(response[dataEndIndex].Province === state) {
                allStatesData.push(response[dataEndIndex]);
                counter++;                          
            }                 
        }          
    });

    return allStatesData;
}

// Display each states data
function displayStateData(states, container, allStatesData, numDays = null) {
    let containerState = document.querySelectorAll('.container-state'); 
    if (states.length === 0) {                       
        clearContainerData(containerState);
        return;
    }


    // Clear state first data here
    clearContainerData(containerState);

    states.forEach((state) => {      
        let containerState = document.createElement('div');        
        containerState.setAttribute("class", "container-state");        
        containerState.insertAdjacentHTML('afterbegin', `<div class="state-name"><h1>${state}</h1></div>`)
    
        allStatesData.forEach((data) => { 
            if(state === data.Province) {                                  
                containerState.insertAdjacentHTML('beforeend', structureDomData(data));                                    
            }    
        })
        container.appendChild(containerState);
    });
    

    function clearContainerData(dataBlock) {
        for (let x = 0; x < dataBlock.length; x++) {
            dataBlock[x].remove();
        }
    }
}

// Convert result's default ISO date format to DD/MMM/YYYY
function convertDateFromIsoFormat(isoDate){
    const calendarMonth = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const sampleDate = new Date(isoDate);
    const year = sampleDate.getFullYear();
    const month = calendarMonth[sampleDate.getMonth()];
    const date = sampleDate.getDate().toString().length < 2 ? '0' + (sampleDate.getDate()).toString() : sampleDate.getDate();        
    return `${date} ${month} ${year}`;
}

// Render covid HTML data structure
function structureDomData(data){
    const html = `
        <section class="day-data">
            <h3 class="day-data-date">${convertDateFromIsoFormat(data.Date)}</h3>
            <ul class="day-data-list-block">                    
                <li>
                    <p class="list-label">Active:</p>
                    <p class="list-data">${data.Active}</p>
                <li>
                    <p class="list-label">Confirmed:</p>
                    <p class="list-data">${data.Confirmed}</p>
                </li>
                <li>
                    <p class="list-label">Deaths:</p>
                    <p class="list-data">${data.Deaths}</p>
                </li>
                <li>
                    <p class="list-label">Recovered:</p>
                    <p class="list-data">${data.Recovered}</p>                
                <li>
            </ul>
        </section>`;    
    return html;
}

// Get and diplay state selection buttons
function displayStateButtons(arrStates, objStateConfig) {
    const optionsStates = document.querySelector('.options-states');    
    const arrStateAbbvs = objStateConfig.states;
    
    arrStates.forEach(state => {
        for (const key in arrStateAbbvs) {
            if (state === key) {
                optionsStates.insertAdjacentHTML('beforeend', `<div class="state-btn state-${arrStateAbbvs[key].toLowerCase()}">${state}</div>`);
            }
        }
    });

    optionsStates.insertAdjacentHTML('beforeend', `<div class="state-btn show-all">Show All</div>`);
    optionsStates.insertAdjacentHTML('beforeend', `<div class="state-btn clear-all">Clear All</div>`);
}

//  Convert AU province names to state abbreviatons
function getStateAbbreviations(arrStates, arrConfigStates){    
    let stateAbbvs = [];
    arrStates.forEach((state, i) => {        
        for (const key in arrConfigStates.states) {
            if (key === state) {
                stateAbbvs.push(arrConfigStates.states[key])                                
            }
        }
    });    

    return stateAbbvs;
}
