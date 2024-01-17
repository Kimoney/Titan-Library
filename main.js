console.log("We init")

// We have a recent search page using a local JSON database.
// Let's fetch that data
const recentSearchUrl = "http://localhost:3000/recents/"
const hiiNayo = "https://openlibrary.org/search.json?q=the+lord+of+the+rings"

function displaySearch (url){
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const mine = data.docs.slice(0,3);
        console.log(mine)
        const myObj = mine.map(books => ({
            id: books.key,
            author: books.author_name,
            title: books.title,
            isbn: books.isbn,
            published: books.publish_date,
            location: books.publish_place,
            cover: books.cover_i,
            subject: books.subject
        }))
        console.log(myObj)
        console.log(myObj[0].title)
    })
}
displaySearch(hiiNayo)

// Function to save our search with a function
function saveSearch (url, searchText, dateString){
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
            },
        body: JSON.stringify(
            {
                recent_search:searchText,
                time: dateString
            })
                })
}
//Function that deletes the user search history making a DELETE request
function deleteSearchHistory (url){
    fetch(url, {method: "DELETE"})
}

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

// We call the function below to save the search in our local json
    saveSearch(recentSearchUrl, searchText, dateString)
}

// Write a function that loads the db.json showing the recent searches
function displayRecentSearch (){
    fetch(recentSearchUrl)
    .then(response => response.json())
    .then(data => renderRecents(data))
// Function Handling data from fetch
    function renderRecents(data){
        console.log(data)
        const myDiv = document.getElementById('recent-data');
        
        data.forEach(previous => {
            let li = document.createElement('li');
            let jsonId= previous.id;
            li.id = "recent";
            li.innerHTML = 
            `<div id="recent-list-div">
            <button class="recent-search-btn" id="recent-search-btn-${jsonId}">${previous.recent_search}</button>
            <span id="search-time"><i class="fa fa-clock-o" aria-hidden="true"></i> ${previous.time}</span> <i class="fa fa-trash" id="delete-icon-${+previous.id}" aria-hidden="true"></i>
            </div>
            `
            
            myDiv.appendChild(li)
            // Function that deletes the recent searches by making a DELETE request
            const deleteIcon = document.getElementById(`delete-icon-${+jsonId}`)

            deleteIcon.addEventListener('click', function(){
            // The delete URL is dynamic and requires an ID
            // The function takes an argument but since we can't invoke it we will put it in an anonymous function invoked when the event is fired
                const deleteUrl = recentSearchUrl+jsonId;
                deleteSearchHistory(deleteUrl)
            })

        })
    }

}
displayRecentSearch()
