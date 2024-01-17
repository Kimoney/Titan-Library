console.log("We init")

// We have a recent search page using a local JSON database.
// Let's fetch that data
const recentSearchUrl = "http://localhost:3000/recents"

function displayRecentSearch (url){
    fetch(url)
    .then(response => response.json())
    .then(data => console.log(data))
}
displayRecentSearch(recentSearchUrl)

// Function to handle our search and make a POST request

const searchBtn = document.getElementById('search-form');
searchBtn.addEventListener('submit', handleSearch)

function handleSearch (event){
    event.preventDefault();

    // The code captures the time a search was done and saves it to our db.json
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate()
    const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentSeconds = currentDate.getSeconds();
    // The variable below combines the time to a human readable time 
    const dateString = currentHour + ':' + currentMinute + ":" + currentSeconds + " on " + currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
    
    const searchText = document.getElementById('search-input').value;
    console.log(`You are searched for ${searchText} at ${dateString}`)
    // Save to Json with a function
    function saveSearch (url){
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(
                {
                    recent_search:searchText,
                    time: dateString
                }
            )
                    })
        .then(response => response.json())
        .then(data => console.log(data))
    }
    saveSearch(recentSearchUrl)
}