# Extending Webos Tutorial to use redux-saga

After doing Wesbos tutorial and [Joel Hooks tutorial](http://joelhooks.com/blog/2016/03/20/build-an-image-gallery-using-redux-saga/) I decided to extend Wesbos lessons with one more to use Saga for the IG API call. He suggested this to be one of the next things to learn when you're done with his tutorial as well.


## Install redux-saga

```
npm install --save redux-saga
```

## Integrating redux-saga

Even though I just finished Joes Hooks tutorial just yesterday I only partly remember the details. So let's have a look again into the files I created.  

### actions

I have an `actions.js` which should more or less work like the one from Wesbos' tutorial. Let's check.  
Hm, ok, yeah, there's no action to load the IG images via the API call.  
And no that I see that we don't load the _images_ but actually _posts_ I also can not just switch that stuff to use whatever API (flickr or IG).  
Isn't there a free service to fake API calls?  
After finding http://jsonplaceholder.typicode.com/ I decided I can mock the API.

#### Mocking the API
```
npm install --save-dev json-server
```

Copy the _data_ `js` files from `./client/data` to `./data`, rename them to `.json` and remove the `js` code insinde (mainly `const` and `export` statements).  
Then merge them into on file, like this: `data.json`  
```
{
   "comments": {
     "BAhvZrRwcfu":[
       {
         "text":"Totally need to try this.",
         "user": "heavymetaladam"
       }
     ],
     
     ...

     "B3eiIwcYV":[
       {
         "text":"If you get in the mood for authentic Italian pizza, check out @backspaceaustin - it's👌🏻",
         "user": "dessie.ann"
       },
       {
         "text":"😱 jealous",
         "user": "jenngbrewer"
       }
     ]
   },

   "posts": [
      {
         "code":"BAcyDyQwcXX",
         "caption":"Lunch #hamont",
         "likes":56,
         "id":"1161022966406956503",
         "display_src":"https://scontent.cdninstagram.com/hphotos-xap1/t51.2885-15/e35/12552326_495932673919321_1443393332_n.jpg"
      },
      
      ...

      {
         "code":"-FpTyHQcau",
         "caption":"I'm in Austin for a conference and doing some training. Enjoying some local brew with my baby.",
         "likes":82,
         "id":"1118481761857291950",
         "display_src":"https://scontent.cdninstagram.com/hphotos-xpt1/t51.2885-15/e35/11326072_550275398458202_1726754023_n.jpg"
      }
   ]
}
```
Now you can serve the data by running:
```
node ./node_modules/json-server/bin/index.js --watch ./data/data.json 
```
Test it by open ` http://localhost:3000/posts`

So now that we serve the original data via a "real" API, how to add sagas?
Maybe by starting to load the data initally first, like Joel did with the flickr images.

#### extending actions.js

First I'll just add a load data action to this. But now that I think about it I might try to add a _loadPosts_ action only:
```
// load posts initally
export function loadPosts(index) {
  return {
    type: 'LOAD_POSTS'
  }
}

```
Done, now what? Hate my brain.

### reducers
In Joel tutorials the `reducer.js` was listening to the _action_. So let's check Wes' files again and see how his reducers can listen to that now.

#### extending `reducers/posts.js`

Wes' split teh reducers into diffrent files (which makes sense). So let's add out created `LOAD_POSTS` action to it. Well no, not exactly, because this _reducer_ won't listen to the _action_ directly, but will instead be notified by the not yet added _saga_. So we add for now, what later will be useful:
```
    case 'POSTS_LOADED':
console.info('POSTS_LOADED');
      return state;

    case 'POST_LOAD_FAILURE':
console.error('oh oh, IMAGE_LOAD_FAILURE');
      return state;
```
I keep it simple and only `console` and `return state` for now.


### adding `sagas/sagas.js`
Now we extended `actionCreators.js` and the `posts.js` reducers.  
To make everything work with each other we need to add the Saga(s) which will be in charge of loading the _posts_.

Looking at Joels `sagas.js`, we copy it and save it in `sagas/sagas.js`.  
We need to modify the functioanlity according to our _posts_ loading needs now:
```
import { fetchPosts } from '../data/posts.js';
import { put, take } from 'redux-saga/effects';

export function* loadPosts() {
  try {
    const Posts = yield fetchPosts();
    yield put({type: 'POSTS_LOADED', Posts});
console.log(Posts);
  } catch(error) {
    yield put({type: 'POSTS_LOAD_FAILURE', error})
  }
}

export function* watchForLoadPosts() {
console.info('LOAD_POSTS');
  while(true) {
    yield take('LOAD_POSTS');
    yield loadPosts();
  }
}
```
Ok, basically I just removed the `selectedImage` function, renamed _Image_ to _Post_ and prepared `data/posts.js` to be reused to `fetch` the posts.  

At this point in time I haven't re-run the app at all. This will end badly. I know it.  
But due to my missing knowledge I am not sure how to start this with a better apoproach, so I just add the posts fetch now and then see whatever error-message I get. Gonna be fun. So follow me into my desaster.  

### re-using `data/posts.js` to fetch the posts from our API
```
const API_ENDPOINT = `http://localhost:3000/posts`;

export const fetchPosts = () => {
  return fetch(API_ENDPOINT).then(function (response) {
    return response.json().then(function (json) {
console.dir(json);
      // return json.photos.photo.map(
      //   ({farm, server, id, secret}) => `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`
      // );
    })
  })
};

```
Ok, if everyhting goes smooth I might get a `console.log` of the _posts JSON_.  
So let's reload the app.
  
¯\_(ツ)_/¯  
  

### First run
Well, ok, even before the first run I know it will break, because we haven't added the new files to the _reduxstagram-app_ at all. Let's run it anyway.  

Yeah, I don't get anythin. Not even an error message. I just get a white page with the headline.  
  
Ok, let's try to trigger the `watchForLoadPosts` saga somehow. How? Let's look at Joel tut again and then decide to import the _sagas_ into the _main file_.

### extending `reduxstagram.js`
```
import createSagaMiddleware from 'redux-saga'
import {watchForLoadPosts} from './sagas';
```

Getting `Uncaught ReferenceError: regeneratorRuntime is not defined` and now added
```
import "babel-polyfill";
```
to the top of `reduxstagram.js`.  
Now getting blank page (with headline) without errors, but also nothign else. `watchForLoadPosts` is not being triggered. Let's figure out where it might should be triggered by looking at Joels files again.  
Well that was obvious. Joel is adding `sagaMiddleware` to the store creation. Can we find where to add this to Wes' files?  

### extending `store.js`
When Joel is creating the store he's stuffing the saga-middleware into the `createStore` function. Wes is just adding the empty default store there. So whatever I just did to `reduxstagram.js` I need to import the saga-stuff into the store I guess.
```
import createSagaMiddleware from 'redux-saga';
import {watchForLoadPosts} from './sagas/sagas';

const store = createStore(rootReducer, applyMiddleware(createSagaMiddleware(watchForLoadPosts)));
```
I removed the _imports_ from `reduxstagram.js`.

`Uncaught ReferenceError: applyMiddleware is not defined` Hm, I guess that's progress. Yep, I did not import that from _Redux_. So Let's:
```
import { createStore, compose, applyMiddleware } from 'redux';
```

#### Excursion into the wilderness of JavaScript updates
So because I just installed teh latest version of `redux-saga` (^0.10.5) and not 0.8.0 like Joel did I now get:
```
Uncaught Error: You passed a function to the Saga middleware. You are likely trying to start a        Saga by directly passing it to the middleware. This is no longer possible starting from 0.10.0.        To run a Saga, you must do it dynamically AFTER mounting the middleware into the store.
        Example:
          import createSagaMiddleware from 'redux-saga'
          ... other imports

          const sagaMiddleware = createSagaMiddleware()
          const store = createStore(reducer, applyMiddleware(sagaMiddleware))
          sagaMiddleware.run(saga, ...args)
```
I could downgrade or actually read this. Let's read it.  
So I should not stuff the Saga directly into the middleware, but do it in a nice way. They actually provided a helpful example. I'm impressed. Sp lets do:
```
const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchForLoadPosts);
```
AAaaaaannnd hooray, we get: `LOAD_POSTS` in the console.


#### Nothing else happens
Trying to figure out why the first Generator isn't calling the `loadPosts` Generator.  
I need to debug this somehow, so first I'll [watch this](https://www.youtube.com/watch?v=ategZqxHkz4) again.  
