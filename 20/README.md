# Extending Wesbos Tutorial to use redux-saga

After doing Wesbos tutorial and [Joel Hooks tutorial](http://joelhooks.com/blog/2016/03/20/build-an-image-gallery-using-redux-saga/) I decided to extend Wesbos lessons with one more to use Saga for the IG API call. He suggested this to be one of the next things to learn when you're done with his tutorial as well.


## Install redux-saga

```
npm install --save redux-saga
```

## Integrating redux-saga

Even though I just finished [Joels tutorial](http://joelhooks.com/blog/2016/03/20/build-an-image-gallery-using-redux-saga/) just yesterday I only partly remember the details. So let's have a look again into the files I created.  

### actions

I have an `actions.js` which should more or less work like the one from Wesbos' tutorial. Let's check.  
Hm, there's no action to load the IG images via the API call.  
And now that I see that we don't load the _images_ but actually _posts_ I also can not just switch that stuff to use whatever API (flickr or IG).  
Isn't there a free service to fake API calls? Yes, after finding http://jsonplaceholder.typicode.com I decided to mock Wesbis' IG API.

#### Mocking the API
```
npm install --save-dev json-server
```

Copy the _data_ `js` files from `./client/data` to `./data`, rename them to `.json` and remove the `js` code inside (mainly `const` and `export` statements).  
Merge them into on file, like this: `data.json`  
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
You can serve the data by running:
```
node ./node_modules/json-server/bin/index.js --watch ./data/data.json 
```
Test it by open ` http://localhost:3000/posts`

Now that we serve the original data via a "real" API, how to add sagas?
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

Wes split the reducers into different files (which makes sense). Let's add our created `LOAD_POSTS` action to this. Well no, not exactly, because this _reducer_ won't listen to the _action_ directly, but will instead be notified by the not yet added _saga_. So we add for now, what later will be useful:
```
    case 'POSTS_LOADED':
console.info('POSTS_LOADED');
      return state;

    case 'POST_LOAD_FAILURE':
console.error('oh oh, POST_LOAD_FAILURE');
      return state;
```
I keep it simple and only `console` and `return state` for now.


### adding `sagas/sagas.js`
We extended `actionCreators.js` and the `posts.js` _reducers_.  
To make everything work with each other we need to add the _saga(s)_ which will be in charge of loading the _posts_.

Looking at Joels `sagas.js`, we copy it and save it in `sagas/sagas.js`.  
We need to modify the functionality according to our _posts_ loading-needs:
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
Ok, even before the first run I know it will break, because we haven't added the new files to the _reduxstagram-app_ at all. Let's run it anyway.  

Yeah, I don't get anything. Not even an error message. I just get a white page with the headline.  
  
Ok, let's try to trigger the `watchForLoadPosts` saga somehow. How? Let's look at Joels tutorial again and then decide to import the _sagas_ into the _main file_.

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
Now getting blank page (with headline) without errors, but also nothing else. `watchForLoadPosts` is not being triggered. Let's figure out where it might should be triggered by looking at Joels files again. (__HINT:__ This still does not trigger it, but it's a start)  
Well that was obvious. Joel is adding `sagaMiddleware` to the store creation. Can we find where to add this to Wes' files?  

### extending `store.js`
When Joel is creating the store he's stuffing the saga-middleware into the `createStore` function. Wes is adding the default store there by importing _comments_ and _posts_.  Whatever I just did to `reduxstagram.js` I need to import the saga-stuff into the store I guess.
```
import createSagaMiddleware from 'redux-saga';
import {watchForLoadPosts} from './sagas/sagas';

const store = createStore(rootReducer, applyMiddleware(createSagaMiddleware(watchForLoadPosts)));
```
I removed the _posts_ & _comments_ _imports_ from `reduxstagram.js`.

`Uncaught ReferenceError: applyMiddleware is not defined` Hm, I guess that's progress. Yep, I did not import that from _Redux_. So let's:
```
import { createStore, compose, applyMiddleware } from 'redux';
```

#### Excursion into the wilderness of JavaScript updates
So because I just installed the _"latest"_ version of `redux-saga` (^0.10.5) and not 0.8.0 like Joel did I now get:
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
I should not stuff the Saga directly into the middleware, but do it in a nice way. They actually provided a helpful example. I'm impressed. So let's do this:
```
const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchForLoadPosts);
```
AAaaaaannnd hooray, we get: `LOAD_POSTS` in the console.

### Wireing the saga functionality

Ok, so this is kinda a jump forward. I fell intro a depression of imposter syndrom.  
Issue was, that I was wondering why nothing else happens for a long time. The `fetch` wasn't called. I thought it will be called when the `store` is created with the `watchForLoadPosts` function. But no, because that one is only watching for a `LOAD_POSTS`. Took me way too long...

#### `Main.js`
Like Joes does in his main _Gallery_ Component we need to actually trigger the `loadPosts` action. So adding this helps:
```
const Main = React.createClass({
  componentDidMount() {
    this.props.loadPosts();
  },
  ...
```


#### `reducers/Posts.js`
Here the `POSTS_LOADED` `switch` will listen to that action type. If that action happens (fetching posts done) it will assign the _posts_ to the `state`.  
```
  case 'POSTS_LOADED':
console.info('POSTS_LOADED');
    return action.posts;
```
This is working, but... I kill the original state. I think. I'm not sure. But let's continue and see what happens. On the other hands the _likes_ still work and I think I only set the inital state there when the posts are being fetched the first time. But it does look wrong.  
Trying this, because it looks right:
```
  return { ...state, posts: action.posts };
```
This will break it though. I think this is because Redux is splitting the store/data into these components by itself. That's why later on in the _posts reducer_ every _state_ is representing one _post_, like here:
```
{...state[i], likes: state[i].likes + 1},
```
But still... something is fishy here.


#### `sagas/sagas.js`
Current state is this:
```
import { fetchPosts } from '../data/posts.js';
import { put, take } from 'redux-saga/effects';

export function* loadPosts() {
console.info('loadPosts');
  try {
    const posts = yield fetchPosts()
console.log(posts)
    yield put({type: 'POSTS_LOADED', posts})
  } catch(error) {
    yield put({type: 'POSTS_LOAD_FAILURE', error})
  }
}

export function* watchForLoadPosts() {
  while(true) {
    yield take('LOAD_POSTS');
    yield loadPosts();
  }
}
```

Now it works.

## Adding saga for comments

The _posts_ are being fetched and added to the store. Can we copy the whole thing and make it work for comments as well? At least fetch them.  
I really just copy the _posts_ approach here:

### `actions/actionCreators.js`
```
// load comments initally
export function loadComments() {
  return {
    type: 'LOAD_COMMENTS'
  }
}
```

### `Main.js`
```
  componentDidMount() {
    this.props.loadPosts();
    this.props.loadComments();
  },
```

### `data/comments.js`
```
const API_ENDPOINT = `http://localhost:3000/comments`;

export const fetchComments = () => {
console.info('fetchComments');
    return fetch(API_ENDPOINT).then( response => response.json())
};
```

### `reducers/comments.js`
```
function comments(state = [], action) {
  if(typeof action.postId !== 'undefined') {
    return {
      // take the current state
      ...state,
      // overwrite this post with a new one
      [action.postId]: postComments(state[action.postId], action)
    }
  }

  switch(action.type){
    case 'COMMENTS_LOADED':
console.info('COMMENTS_LOADED');
      return action.comments;

    case 'COMMENT_LOAD_FAILURE':
console.error('oh oh, POSTS_LOAD_FAILURE');
      return state;

    default:
      return state;
  }

  return state;
}
```

### `sagas/sagas.js`
```
export function* loadComments() {
console.info('Comments');
  try {
    const comments = yield fetchComments()
console.log(comments)
    yield put({type: 'COMMENTS_LOADED', comments})
  } catch(error) {
    yield put({type: 'COMMENTS_LOAD_FAILURE', error})
  }
}


export function* watchForLoadComments() {
  while(true) {
    yield take('LOAD_COMMENTS');
    yield loadComments();
  }
}
```

### `store.js`
```
import {watchForLoadPosts, watchForLoadComments} from './sagas/sagas';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(watchForLoadPosts);
sagaMiddleware.run(watchForLoadComments);
```

Now _comments_ are working as well.