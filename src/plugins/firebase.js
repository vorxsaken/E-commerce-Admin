import firebase from 'firebase/app';
import "firebase/firestore";

const firebaseConfig = {
    // gunakan generate key dari database firebase mu sendiri
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { timestamp };
export default firebaseApp.firestore();