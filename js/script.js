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

  // -- Request thumbnail
  requestURL += '&thumbs=True';

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

  nasaJson.forEach(mediaObj => {
    let galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    if(mediaObj.media_type === 'video')
    {
      // Create the video tag, which does not contain the actual URL source
      let itemVid = document.createElement('video');
      itemVid.setAttribute('controls', 'true');

      // Determine the file format of the video to ensure the source tag is defined correctly
      let srcUrl = new URL(mediaObj.url);
      let srcExtIndex = srcUrl.pathname.lastIndexOf('.');
      let srcExt = srcExtIndex == -1 ? 'mp4' : srcUrl.pathname.substring(srcExtIndex+1);

      // Create a source tag that will be added to the video tag to provide the video's source file
      let itemSrc = document.createElement('source');
      itemSrc.setAttribute('src', mediaObj.url);
      itemSrc.setAttribute('type', 'video/'+srcExt);
      itemVid.appendChild(itemSrc);

      galleryItem.appendChild(itemVid);
    }
    else
    {
      // Create the img tag, which contains the URL source
      let itemImg = document.createElement('img');
      itemImg.setAttribute("src", mediaObj.url);
      galleryItem.appendChild(itemImg);
    }

    // Create the paragraph that will hold information on the image/video
    let infoPg = document.createElement('p');
    infoPg.innerHTML = `<h3>${mediaObj.title}</h3><br/>${mediaObj.date}`;
    galleryItem.appendChild(infoPg);

    gallery.appendChild(galleryItem);
  });
});