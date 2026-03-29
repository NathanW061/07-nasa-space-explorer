// -- HTML elements
// Date range input fields
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
// Retrieval button
const getImagesBtn = document.getElementById('requestImagesBtn');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// -- Event listeners
getImagesBtn.addEventListener('click', async () => {
  let requestURL = 'https://api.nasa.gov/planetary/apod/?';

  console.log("Requesting images...");

  // -- Fetch and insert API key
  // Fetch JSON file containing API key
  let keyResponse = await fetch('js/key.json');
  if(!keyResponse.ok)
  {
    alert('Could not retrieve API key from file.');
    return;
  }
  // Check if API key is present in JSON file before continuing
  let apiKeyJson = await keyResponse.json();
  let apiKey = apiKeyJson.api_key;
  if(apiKey === undefined || apiKey === null)
  {
    alert('API key was not specified.');
    return;
  }

  requestURL += `api_key=${apiKey}`;

  // -- Specify date range selected by user
  requestURL += `&start_date=${startInput.value}`;
  requestURL += `&end_date=${endInput.value}`;

  // -- Send GET request
  let nasaResponse = await fetch(requestURL);
  console.log(nasaResponse);
  if(!nasaResponse.ok)
  {
    console.log(`Image request returned status: '${nasaResponse.statusText}'.`);
    alert('Images could not be retrieved. Please try again later.');
    return;
  }

  // -- Display received images
  let nasaJson = await nasaResponse.json();
  console.log(nasaJson);

  let gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  nasaJson.forEach(imgObj => {
    let galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    let itemImg = document.createElement('img');
    itemImg.setAttribute("src", imgObj.url);
    galleryItem.appendChild(itemImg);

    gallery.appendChild(galleryItem);
  });
});