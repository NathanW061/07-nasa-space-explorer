// -- HTML elements
// Date range input fields
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
// Retrieval button
const getImagesBtn = document.getElementById('requestImagesBtn');
// Modal divs
const modalCover = document.getElementById('modalCover');
const detailsModal = document.getElementById('detailsModal');

const failureGalleryHTML = '<div class="placeholder"><div class="placeholder-icon">❌</div><p>Could not reach NASA\'s servers. Please try again.</p></div>';

let apiKey = null;

function createVideoFromMedia(mediaObj, controls)
{
  // Create the video tag, which does not contain the actual URL source
  let itemVid = document.createElement('video');
  if(controls)
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

  return itemVid;
}

function displayModal(mediaObj)
{
  modalCover.style.display = 'block';
  detailsModal.innerHTML = '';

  if(mediaObj.media_type == 'video')
  {
    detailsModal.appendChild(createVideoFromMedia(mediaObj, true));
  }
  else
  {
    // Create an img element, which uses the URL source
    let itemImg = document.createElement('img');
    let imgUrl = mediaObj.hdurl !== null ? mediaObj.hdurl
                                         : mediaObj.url;
    itemImg.setAttribute("src", imgUrl);
    detailsModal.appendChild(itemImg);
  }

  // Create the paragraph that will hold information on the image/video
  let infoPg = document.createElement('div');
  infoPg.classList.add('modal-text');

  let infoHTML = `<h2>${mediaObj.title}</h2><br/>`;
  if(mediaObj.copyright !== undefined)
    infoHTML += `<b>${mediaObj.copyright}</b>&nbsp;-&nbsp;`;
  infoHTML += `<i>${mediaObj.date}</i><br/><br/>`;
  infoHTML += mediaObj.explanation;

  infoPg.innerHTML = infoHTML;
  detailsModal.appendChild(infoPg);
}

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// -- Event listeners
getImagesBtn.addEventListener('click', async () => {
  let requestURL = 'https://api.nasa.gov/planetary/apod/?';

  console.log("Requesting images...");
  let gallery = document.getElementById('gallery');
  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading images from the selected date range...</p></div>';

  // -- Fetch and insert API key
  // Check if API key is already in memory
  if(apiKey == null)
  {
    console.log('Searching for API key file...');

    // Fetch JSON file containing API key
    let keyResponse = await fetch('js/key.json');
    if(keyResponse.ok)
    {
      console.log('API key file found.');
      // Check if API key is present in JSON file before continuing
      let apiKeyJson = await keyResponse.json();
      apiKey = apiKeyJson.api_key;
      if(apiKeyJson.api_key === undefined || apiKeyJson.api_key === null)
      {
        console.log('API key was not present in the file.');
        apiKey = null;
      }
    }
    else
      console.log('API key file was not found.');
    
    // Check if API key has been found yet
    if(apiKey == null)
    {
      console.log('Requesting API key from user...');
      apiKey = prompt('The API key could not be found. Please enter a NASA API key.');
      if(apiKey == null)
      {
        console.log('User did not specify an API key. Cancelling request.');
        alert('You must enter an API key to use this website.');
        gallery.innerHTML = failureGalleryHTML;
        return;
      }
    }
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
    gallery.innerHTML = failureGalleryHTML;
    return;
  }

  // -- Display received images
  let nasaJson = await nasaResponse.json();
  console.log(nasaJson);

  gallery.innerHTML = '';

  nasaJson.forEach(mediaObj => {
    let galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    if(mediaObj.media_type === 'video')
    {
      galleryItem.appendChild(createVideoFromMedia(mediaObj, false));
    }
    else
    {
      // Create an img element, which uses the URL source
      let itemImg = document.createElement('img');
      itemImg.setAttribute("src", mediaObj.url);
      galleryItem.appendChild(itemImg);
    }

    galleryItem.addEventListener('click', () => displayModal(mediaObj));

    // Create the paragraph that will hold information on the image/video
    let infoPg = document.createElement('p');
    infoPg.innerHTML = `<h3>${mediaObj.title}</h3><br/>${mediaObj.date}`;
    galleryItem.appendChild(infoPg);

    gallery.appendChild(galleryItem);
  });
});

modalCover.addEventListener('click', () => {
  modalCover.style.display = 'none';
});

detailsModal.addEventListener('click', (e) => {
  // Prevent clicking inside of details modal from closing it
  e.stopPropagation();
});

// Display a random space fact from NASA's solar system facts page (https://science.nasa.gov/solar-system/solar-system-facts/)
const facts = [
  "Our solar system includes the Sun, eight planets, five officially named dwarf planets, hundreds of moons, and thousands of asteroids and comets.",
  "Our planetary system is called “the solar system” because we use the word “solar” to describe things related to our star, after the Latin word for Sun, \"solis.\"",
  "Our solar system has hundreds of moons orbiting planets, dwarf planets, and asteroids.",
  "The Oort Cloud is the boundary of the Sun's gravitational influence, where orbiting objects can turn around and return closer to our Sun.",
  "Our solar system orbits the center of the galaxy at about 515,000 mph (828,000 kph)."
];

document.getElementById('space-fact').firstChild.innerHTML = `<b>“</b>${facts[Math.floor(Math.random() * facts.length)]}<b>”</b>`;