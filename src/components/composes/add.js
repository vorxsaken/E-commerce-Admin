import db from "@/plugins/firebase.js";
import firebase from 'firebase';
import 'firebase/storage';


export function add(target, data) {
    const database = db.collection(target).doc();
    database.set(data).then(() => {
        console.log("data added to " + target);
    }).catch((err) => {
        console.log(err);
    })
}

export async function addWithAFile(id, target, targetFiles, data, files) {
    return new Promise((myResolve, myReject) => {
        const database = db.collection(target).doc(id);
        const storageRef = firebase.storage().ref();
        const docRef = storageRef.child(targetFiles);
        docRef.put(files).on(
            "state_changed",
            () => { },
            (err) => { console.log(err) },
            () => {
                database.set(data).then(async () => {
                    const fileURL = await docRef.getDownloadURL();
                    database.update({
                        url: fileURL
                    }).then(() => {
                        myResolve(`data and files succesfully added`);
                    }).catch((err) => {
                        myReject(err);
                    });
                }).catch((err) => { console.log(err) })
            }
        )
    })
}

export function addWithFiles(target, targetFiles, subName, data, arrayOfFiles) {
    var count = 0;
    var isDone = false;
    const database = db.collection(target).doc();
    database.set(data).then(() => { console.log("success add data") }).catch((err) => {
        console.log(err);
    })
    for (const file of arrayOfFiles) {
        const storageRef = firebase.storage().ref();
        const docRef = storageRef.child(`/${targetFiles}/${file.name}`);
        docRef.put(file).on(
            "state_changed",
            () => { },
            (err) => { console.log(err) },
            () => {
                const url = docRef.getDownloadURL();
                const subCollection = db.collection(target).doc(database.id).collection(subName).doc();
                subCollection.set({
                    id: subCollection.id,
                    nama: file.name,
                    ukuran: file.size,
                    src: url
                }).then(() => {
                    count++;
                    if (count == arrayOfFiles.length) {
                        isDone = true;
                        return { isDone };
                    }
                })
            }
        )
    }
}