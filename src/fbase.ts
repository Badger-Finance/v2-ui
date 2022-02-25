import firebase from 'firebase';
import config from './config/system/firebase.json';

const app = firebase.initializeApp(config);

export default app;
