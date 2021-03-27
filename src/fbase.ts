import config from './config/system/firebase.json';
import firebase from 'firebase';

const app = firebase.initializeApp(config);

export default app;
