import { fetchPosts } from '../data/posts.js';
import { put, take } from 'redux-saga/effects';

// fetchPosts();

export function* loadPosts() {
console.info('loadPosts');
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