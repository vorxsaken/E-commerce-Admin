import db from "@/plugins/firebase.js";

export function remove(target, id) {
  return new Promise((resolve, reject) => {
    const database = db.collection(target).doc(id);
    database
      .delete()
      .then(() => {
        resolve("data deleted at " + target);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
