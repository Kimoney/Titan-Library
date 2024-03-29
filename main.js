function init (){
// We have an add wishlist column that is using a local JSON database, the variable below holds that url
const wishlistUrl = "http://localhost:3000/wishlists/"
// The code captures the server time and saves it in a variable
const currentDate = new Date();
const currentDayOfMonth = currentDate.getDate()
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();
const currentHour = currentDate.getHours();
const currentMinute = currentDate.getMinutes();
const currentSeconds = currentDate.getSeconds();
// The variable below changes the time to a human readable time 
const dateString = currentHour + ':' + currentMinute + ":" + currentSeconds + " on " + currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;

function displaySearch (url){
    fetch(url)
    .then(response => response.json())
    .then(data => {
// From the public API, we only take a specific range from the results
        const myResults = data.docs.slice(0,30);
// The hasOwnProperty method checks whether the ISBN is available because it is vital in generating the book covers according to OpenLibrary API
        const filteredResult = myResults.filter(singleObject => singleObject.hasOwnProperty('isbn'))
// The condition below alerts the user that there are no search results for their query when we fail to capture an array after filtering our data
        if (filteredResult.length === 0){
            const myDiv = document.getElementById('main-container')
// This code removes and replaces the DOM element with an error message and another button that takes the user back to the search form
            const previousState = document.getElementById('search-div')
            if(document.contains(previousState)){
                previousState.remove()
            }
            
            let errorDiv = document.createElement('div')
            errorDiv.id = "search-div"
            errorDiv.innerHTML = 
            `
            <h1 id="heading">I Found Nothing</h1>
            <a href="http://127.0.0.1:5500/index.html?"><button id="error-search-btn" type="submit">Try Again</button></a>
            `
            myDiv.appendChild(errorDiv)
        } else {
// Define the properties of the new object
        const myObj = filteredResult.map(books => ({
            id: books.key,
            author: books.author_name,
            title: books.title,
            isbn: books.isbn[0],
            published: books.first_publish_year
        }))
// Create the elements that will render the results
        const cardContainer = document.createElement('div');
            cardContainer.id = "cards-container"
            const searchDiv = document.getElementById('search-div')
            if (document.contains(searchDiv)){
                searchDiv.replaceWith(cardContainer)
            }
// Iteration of each book from our sliced and filtered results
        myObj.forEach(book => {
// Grab the element to append the dynamic data
            const myDiv = document.getElementById('cards-container')
            
            let resultDiv = document.createElement('div')
            resultDiv.id = "card"
            resultDiv.innerHTML = 
            `
                        <img id="cover" src="https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg" alt="${book.isbn}">
                        <p id="book-title">${book.title}</p>
                        <p id="book-author">${book.author}</p>
                        <p id="published">First published in ${book.published}</p>
            `
            myDiv.appendChild(resultDiv)
        })}
    })
}

// saveSearch is a function to save our wishlist from the input in the add wishlist form by making a POST request

function saveWishlist (url, myWishlist, dateString){
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
            },
        body: JSON.stringify(
            {
                wishlist:myWishlist,
                time: dateString
            })
                })
}

// updateSearch is a function to update an existing wishlist by making a PATCH request

function updateWishlist (url, dateString){
    fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type":"application/json"
            },
        body: JSON.stringify(
            {
                time: dateString
            })
                })
}
//deleteSearchHistory function that deletes the user search history making a DELETE request
function deleteSearchHistory (url){
    fetch(url, {method: "DELETE"})
}
// displayWishlists is a function that loads the db.json showing the recent searches
function displayWishlists (){
    fetch(wishlistUrl)
    .then(response => response.json())
    .then(data => renderWishlists(data))
// Function Handling data from fetch
    function renderWishlists(data){
        const myDiv = document.getElementById('wishlist-data');        
        data.forEach(singleWishlist => {
            let li = document.createElement('li');
            let jsonId= singleWishlist.id;
            li.id = "singleWishlist";
            li.innerHTML = 
            `<div id="wishlist-list-div">
            <p class="wishlist-p" id="wishlist-btn-${jsonId}">${singleWishlist.wishlist}</p>
            <span id="wishlist-time"><i class="fa fa-clock-o" aria-hidden="true"></i> ${singleWishlist.time}</span> <i class="fa fa-trash" id="delete-icon-${+singleWishlist.id}" aria-hidden="true"></i>
            </div>
            ` 
            myDiv.appendChild(li)
            // Function that deletes the recent searches by making a DELETE request upon click of an icon
            const deleteIcon = document.getElementById(`delete-icon-${+jsonId}`)
            deleteIcon.addEventListener('click', function(){
            // The delete URL is dynamic and requires an ID
            // The function takes an argument but since we can't invoke it we will put it in an anonymous function invoked when the event is fired
                const deleteUrl = wishlistUrl+jsonId;
                deleteSearchHistory(deleteUrl)
            })

        })
    }

}
displayWishlists()

// handleSearch is a function that handles data from the search form and sends a query to the public API by making a GET request

const searchBtn = document.getElementById('search-form');
searchBtn.addEventListener('submit', handleSearch)

function handleSearch (event){
    event.preventDefault();
    const searchText = document.getElementById('search-input').value;
    const newURL = `https://openlibrary.org/search.json?q=${searchText}`
    displaySearch(newURL)
}

// The event listener below listens for the wishlist form submission

const wishlistForm = document.getElementById('wishlist-form')
wishlistForm.addEventListener('submit', handleWishlistForm)

// Function that will save our wishlists after filling the wishlist form

function handleWishlistForm (event){
    event.preventDefault()
    const myWishlist = document.getElementById('wishlist-text').value;
    fetch(wishlistUrl)
    .then(response => response.json())
    .then(data => checkIfWishlistExist(data))

// The Function checkIfWishlistExist checks whether a book already exists in the wishlists json database. If it exists a PATCH request is made, else a POST Request is made

    function checkIfWishlistExist(data){
        const existingElementIndex = data.findIndex(wish => wish.wishlist === myWishlist)
        const singleWishlistObj = data[existingElementIndex]
        if (singleWishlistObj === -1) {
            saveWishlist(wishlistUrl, myWishlist, dateString)
// The else if below prevents a TypeError because the last else throws an undefined due to the .id (Took me a whole day to figure out!!)
        } else if (singleWishlistObj === null || singleWishlistObj === undefined){
            saveWishlist(wishlistUrl, myWishlist, dateString)
        }
        else{
            let patchUrl = wishlistUrl+singleWishlistObj.id
            alert(`${myWishlist} already exists!`)
            updateWishlist(patchUrl, dateString)
            }
    }
}
}

document.addEventListener("DOMContentLoaded", init)