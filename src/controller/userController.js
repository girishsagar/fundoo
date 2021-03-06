/**
 * @file :userController
 * @description :firebase console to store the data/informartion backend
 * @author :Girish Sagar <girishsagar51@gmail.com>
 * @version :16.12.0 (react version)
 * @since :18-dec-2019
 */
import jwt from "jsonwebtoken";
import firebase from "firebase";
import Firebase from "../firebaseConfig";
import { EventEmitter } from "events";
import jwt_decode from "jwt-decode";
const db = Firebase.firestore();
export async function registeration(user) {
    try {
        const data = {
            firstName: user.firstName,
            lastName: user.lastName,
            Email: user.Email,
            password: user.password
        };
        await firebase.auth().createUserWithEmailAndPassword(user.Email, data.password);
        db.collection("user").doc(firebase.auth().currentUser.uid).set(data);
        //passing an evnt emitter
        const emitter = new EventEmitter();

        function EmailVerification() {
            firebase.auth().currentUser.sendEmailVerification();
        }
        emitter.on("Email verification", EmailVerification);
        emitter.emit("Email verification");
        return "success";
    } catch (err) {
        console.log("err");
        return err.message;
    }
}
/**
 * 
 * @param {user} user 
 * @param {cb} cb 
 * @description :user login details email and password 
 * @author :Girish Sagar <girishsagar51@gmail.com>
 * @version :16.12.0 (react version)
 * @since :19-dec-2019  
 */
// export async function userlogin(user, cb) {
//     try {
//         let userlogin = await firebase.auth().signInWithEmailAndPassword(user.Email, user.password);
//         const payload = {
//             user_id: userlogin.user.uid,
//             email: userlogin.user.email
//         };
//         /**
//          * @description: using an jwt tokens
//          */
//         // let token = jwt.sign({payload}, "hsdyusd99d787sd7sjd89sdsd", {
//         const jwtKey = "myScreat";
//         let token = jwt.sign({ payload }, jwtKey, {
//             algorithm: 'HS256',
//             expiresIn: 1440
//         });
//         console.log("the screat key is ", token);

//         localStorage.setItem("usertoken", token);
//         console.log(token);
//         cb(null, userlogin);
//     } catch (error) {
//         console.log(error);
//         cb(error.message);
//     }
// }
export async function userlogin(user, cb) {
    try {
        let userlogin = await firebase
            .auth()
            .signInWithEmailAndPassword(user.Email, user.password);
        const payload = {
            user_id: userlogin.user.uid,
            email: userlogin.user.email
        };
        let token = jwt.sign(payload, "hsdyusd99d787sd7sjd89sdsd", {
            expiresIn: 1440
        });
        localStorage.setItem("usertoken", token);
        console.log(token);
        cb(null, userlogin);
    } catch (error) {
        console.log(error);
        cb(error.message);
    }
}
/**
 * 
 * @param {*} Email 
 * @description :user forget password they can rest with an registraction email-i
 * */
export async function forgotPassword(Email) {
    try {
        await firebase.auth().sendPasswordResetEmail(Email);

        return "success";
    } catch (error) {
        console.log(error);
        return error.message;
    }
}
/**
 * @file :signOut
 * @description :sign out from an application 
 */
export async function Signout() {
    await firebase.auth().firebaseAuthorization.signOut();
    localStorage.removeItem("usertoken");
}
/**
 * @file : savaNote 
 * @description :saving user enterd notes like title,descrption,color and label to the specific user id
 */
export async function saveNote(data, labels) {
    try {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        const noteData = {
            title: data.title,
            description: data.description,
            isPinned: data.isPinned,
            color: data.color,
            archieve: data.archieve,
            isDeleted: data.isDeleted,
            reminder: data.reminder,
            labels: data.labels,
            user_id: decoded.user_id
        };
        await db.collection("notes").add(noteData).then(function(docRef) {
            if (labels.length > 0) {
                labels.forEach(function(labelData) {
                    console.log("label name", labelData.label);
                    let labelDoc = db.collection("labels").doc(labelData.id);
                    labelDoc.update({
                        note_id: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                    });
                });
            }
        });
        let result = true;
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}
/**
 * @file ;getNote
 * @description :displaying the notes like (title,color,descrption)of particular user
 */
export async function getNote() {
    try {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        var noteData = [];
        await db.collection("notes").where("user_id", "==", decoded.user_id).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    noteData.push(doc);
                });
            });
        console.log(noteData);
        return noteData;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}
/**
 * @file ;editNote
 * @description ;modifiy the old notes 
 */
export async function editNote(noteData) {
    await db.collection("notes").doc(noteData.noteId).update({
            title: noteData.title,
            description: noteData.description
        })
        .then(res => {
            res = true;
            return res;
        })
        .catch(error => {
            console.log(error.message);
            return error.message;
        });
}
/**
 * @file :pinNotes
 * @description ;pin and unpin the notes of particular notes
 */
export async function pinNotes(noteData) {
    if (noteData.isPinned) {
        await db.collection("notes").doc(noteData.noteId)
            .update({
                isPinned: noteData.isPinned
            })
            .then(res => {
                console.log("res", res);
                res = true;
                return res;
            })
            .catch(error => {
                console.log(error.message);
                return error.message;
            });
    } else {
        await db.collection("notes").doc(noteData.noteId).update({
                isPinned: noteData.isPinned
            })
            .then(res => {
                res = true;
                return res;
            })
            .catch(error => {
                console.log(error.message);
                return error.message;
            });
    }
}
/**
 * @file ;archiveTheNote
 * @description :mark important  note in archive
 *  */
export async function archiveTheNote(noteData) {
    console.log("n.lhjkljl", noteData);
    let data = noteData.noteId;
    console.log("the databacj", data);
    await db.collection("notes").doc(noteData.noteId).update({
            archieve: noteData.archieve
        })
        .then(res => {
            res = true;
            return res;
        })
        .catch(error => {
            return error.message;
        });
}
/**
 * 
 * @file :addNoteTrash
 * @description ;remov
 */
export async function addNoteToTrash(noteData) {
    await db.collection("notes").doc(noteData.noteId)
        .update({
            isDeleted: noteData.isDeleted
        })
        .then(res => {
            res = true;
            return res;
        })
        .catch(function(error) {
            return error.message;
        });
}
export async function deleteNote(noteData) {
    await db
        .collection("notes")
        .doc(noteData.noteId)
        .delete()
        .then(res => {
            res = true;
            return res;
        })
        .catch(function(error) {
            return error.message;
        });
}
export async function restoreNote(noteData) {
    await db.collection("notes").doc(noteData.noteId).getupdate({
            isDeleted: false
        })
        .then(res => {
            res = true;
            return res;
        })
        .catch(function(error) {
            return error.message;
        });
}

export async function colorChange(noteData) {
    await db
        .collection("notes")
        .doc(noteData.id)
        .update({
            color: noteData.color
        })
        .then(res => {
            res = true;
            return res;
        })
        .catch(function(error) {
            return error.message;
        });
}
export async function saveLabel(data) {
    try {
        const token = localStorage.usertoken;
        const decoded = jwt_decode(token);
        const labelData = {
            label: data.label,
            isDeleted: false,
            note_id: [],
            user_id: decoded.user_id
        };
        await db
            .collection("labels").doc().set(labelData);
        var labels = [];
        await db
            .collection("labels")
            .where("user_id", "==", decoded.user_id)
            .where("note_id", "==", [])
            .where("isDeleted", "==", false)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    labels.push({ id: doc.id, label: doc.data().label });
                });
            });
        return labels;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

/**
 * Count the number of notes and pinned 
 */
export async function geNoteCount() {
    try {
        const token = localStorage.usertoken
        const decoded = jwt_decode(token)
        let isPinned, archieve, trash, others
        await db.collection("notes")
            .where("user_id", "==", decoded.user_id)
            .where("isPinned", "==", true).get().then(snap => {
                isPinned = snap.size // will return the collection size
            });

        await db.collection("notes")
            .where("user_id", "==", decoded.user_id)
            .where("archieve", "==", true).get().then(snap => {
                archieve = snap.size // will return the collection size
            });
        await db.collection("notes")
            .where("user_id", "==", decoded.user_id)
            .where("isDeleted", "==", true).get().then(snap => {
                trash = snap.size // will return the collection size
            });
        const result = {
            isPinned: isPinned,
            archieve: archieve,
            trash: trash,

        }
        return result
    } catch (error) {
        console.log(error)
        return error.message
    }
}


export async function getAllLabel() {
    try {
        const token = localStorage.usertoken
        const decoded = jwt_decode(token)
        var labels = [];
        await db.collection("labels")
            .where("user_id", "==", decoded.user_id)
            .where("isDeleted", "==", false).get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    labels.push({ id: doc.id, label: doc.data().label })
                });
            })
        console.log("the backend po0f date is 0", labels);

        return labels
    } catch (error) {
        console.log(error)
        return error.message
    }
}