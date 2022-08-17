# Varial Media Library Server
A server that stores and optimizes images. Saves backups to s3-compatible buckets.

## Initial setup
This program uses Express.js to run the server, so you will need Node.js install on your system. The server also stores backups of your images to an s3-compatible object store, so you will need to set up an s3 bucket through [Amazon Web Service](https://aws.amazon.com/), or through another cloud provider such as [Linode](https://www.linode.com/), [DigitalOcean](https://www.digitalocean.com/), or [Vultr](https://www.vultr.com/).

### Download Source Code
You can get the source code for this project in one of two ways:

#### Clone the repository using git:
```git clone https://github.com/Varial-Web-Development/varial-media-library.git <your-folder-name>```

#### Download the respoitory as a zip file from GitHub: 
[https://github.com/varialweb/varial-media-library/archive/refs/heads/main.zip](https://github.com/varialweb/varial-media-library/archive/refs/heads/main.zip)

### Install Node.js
To install Node.js, go to [the Node.js download page](https://nodejs.org/en/download/), and download the appropriate file for your system.

### Create s3-compatible Storage Container
Pick your favorite hosting provider and create an s3-compatible storage container and bucket for your project.

### Install dependencies
Inside your project folder, run an install command with either yarn or npm

#### Yarn
```yarn install```

#### NPM
```npm install```

### Create .env file
You will need to create a .env file when running the server locally. It should look something like this:

```
PORT=3001
BASE_URL=http://localhost:3001
BUCKET_URL=<url_to_bucket_region>
BUCKET_REGION=us-east
BUCKET_NAME=<your-bucket-name>
SPACES_KEY=<key_to_object_storage>
SPACES_SECRET=<object_storage_secret>
API_SECRET=<a hash for accessing the api>
```

## Running Server
### Locally
To run the server locally you will need to make sure you have your environmental variables set up in your .env file. Then run `yarn dev` or `npm run dev` to start the server.

### Using Caddy Server
In developer and production the server should be run through a reverse proxy. [Caddy server](https://caddyserver.com/) is a very easy to set up web server that you can use locally and in production. Install Caddy via their instructions and then you can run Caddy in the project directory with the Caddy config file (Caddyfile) that we have supplied.

### Production
Running the server in production can be just as easy as running it in development. Here is an example how you would change the Caddyfile to run on a private server

```
yourdomain.com {
        reverse_proxy localhost:3001
}
```

## Using the Server
The server can handle image optimizations and serve them to you via URLS. The following examples will show how to use the Fetch API and Javascript, but you can access these URLs in any language.

### Getting a list of all objects
```
// This code should be run server-side, so that your end users cannot access the API key
const myApiKey = process.env.MEDIA_API_KEY 

fetch('https://localhost:3001/objects', {
  method: 'POST',
  body: JSON.stringify({
    apiKey: myApiKey
  })
})
.then(response => response.json())
.then(response => {
  if (response.files) {
    // do something with objects
  }
})
.catch(error => console.error('Error fetching objects', error))
```
### Get a single object
Images can be accessed by URL:
```<img src="https://localhost/objects/my-object-id">```

#### Optimizing images
Images can be resized by adding various queries to the URL

##### Change the width
```<img src="https://localhost/objects/my-object-id?w=768">```

##### Change the height
```<img src="https://localhost/objects/my-object-id?h=400">```

##### Change the quality
```<img src="https://localhost/objects/my-object-id?q=60">```

##### Adjusting the fit
By default, the server will handle adjustments to the width *and* height by setting the fit to 'cover', meaning that it will zoom into the center of the image. 

You can change this behavior by adding the query argument `fit`. Accepts the following values: `cover, contain, fill, outside, inside`

```<img src="https://localhost/objects/my-object-id?w=400&h=300&q=60&fit=fill">``` 

##### Examples

```https://localhost/object/beach-sunglasses```

![](https://media.varial.dev/objects/beach-sunglasses)

```https://localhost/objects/beach-sunglasses?w=800&h=300```

![](https://media.varial.dev/objects/beach-sunglasses?w=800&h=300)

```https://localhost/objects/beach-sunglasses?w=600&h=250```

![](https://media.varial.dev/objects/beach-sunglasses?w=600&h=250)

```https://localhost/objects/beach-sunglasses?w=400&h=250```

![](https://media.varial.dev/objects/beach-sunglasses?w=400&h=250)


### Upload an object
#### HTML:
```
<form id="upload-form">
  <label>Upload Image</label>
  <input type="file" id="file" name="file" accept="image/*">
</form>
```

#### Javascript:
```
// This code shouldn't be run on any routes your clients can access. 
// If you need to have clients upload files then you should handle 
// the form submission server-side

const form = document.querySelector('#upload-form')

form.addEventListener('submit', event => {
  event.preventDefault()
  
  const file = document.querySelector('#file')
  const fileReader = new FileReader()
  const name = file.files[0].name.replace('.jpeg', '').replace('.jpg', '').replace('.png', '').replace('.webp', '')
  
  fileReader.readAsDataURL(file.files[0])
  
  fileReader.onloadend = (e) => {
    fetch('https://localhost/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: myApiKey, // this should be stored as an environmental variable
        name, 
        file: fileReader.result, 
        sizes: [], // this field is optional, if it isn't included then it will just create the original size 
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response.object) {
        // do something after successful upload
      }
    })
    .catch(error => console.error(error))
  }
})
```

### Delete an object
Delete an object by sending a request via URL

```
fetch('https://localhost/delete/my-object-id', {
  method: 'DELETE',
  body: JSON.stringify({
    apiKey: myApiKey // this should be stored as an environmental variable
  })
})
.then(response => response.json())
.then(response => {
  if (response.object === 'deleted') {
    // do something after successful deletion
  }
})
.catch(error => console.error('Error deleting object:', error)
```
