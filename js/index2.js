
const firebaseui = require('firebaseui');

const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");



const firebaseConfig = {
  
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function amICalled() {
    console.log("called");
}

function addData(fsDatabase, fsFunction, user) {
    console.log("clicked");
    var newDoc = fsDatabase.collection("campaigns").doc("doc1");
    newDoc
        .set({
            timestamp: fsFunction.FieldValue.serverTimestamp(),
            uid: user.uid,
            name: "doc1"
        });
    newDoc = fsDatabase.collection("campaigns").doc("doc2");
    newDoc
        .set({
            timestamp: fsFunction.FieldValue.serverTimestamp(),
            uid: user.uid,
            name: "doc2"
        });
    newDoc = fsDatabase.collection("campaigns").doc("doc3");
    newDoc
        .set({
            timestamp: fsFunction.FieldValue.serverTimestamp(),
            uid: user.uid,
            name: "doc3"
        });
}

function deleteDoc(fsDatabase, collection, docId) {
    fsDatabase.collection(collection).doc(docId).delete();
}

function deleteAll(fsDatabase) {
    fsDatabase.collection("campaigns").doc("doc1").delete();
    fsDatabase.collection("campaigns").doc("doc2").delete();
    fsDatabase.collection("campaigns").doc("doc3").delete();
}

function realTimeListener(fsDatabase, collection, field, opStr, value) {
    fsDatabase.collection(collection).where(field, opStr, value)
        .onSnapshot(function (querySnapshot) {
            console.log(Math.random() + " listener");
            if (querySnapshot.docs.length == 0) {
                console.log({ "status": "noDocuments" });
            } else {
                let docs = [];
                querySnapshot.forEach(function (doc) {
                    docs.push({ "id": doc.id, "data": doc.data() });
                });
                console.log(docs);
            }
        }, function (err) {
            console.log(err);

        });
}


//Firestore
const db = firebase.firestore();
if (window.location.hostname === "localhost") {
    console.log("localhost detected!");
    db.settings({
        host: "localhost:8080",
        ssl: false
    });
}

function multipleLogin(loginOptions) {
    return uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                console.log(authResult.user)
                //statusPort.send(authResult.user);
                return false;
            },
            uiShown: function () {
                console.log("ui shown");
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInOptions: loginOptions
    }

}

function login() {
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#loginUiContainer',
        multipleLogin([firebase.auth.GoogleAuthProvider.PROVIDER_ID]
        )
    );
}

firebase.firestore().enablePersistence();


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        //set up realtime
        realTimeListener(db, "campaigns", "uid", "==", user.uid);


        document.getElementById("addData").addEventListener("click", function () {
            addData(db, firebase.firestore, user);
        });

        document.getElementById("deleteData").addEventListener("click", function () {
            deleteDoc(db, "campaigns", "doc1")
        });

        document.getElementById("deleteAllDocs").addEventListener("click", function () {
            deleteAll(db);
        });


    } else {
        // User is signed out.
        document.getElementById("login").addEventListener("click", login());

        console.log("no user");
    }
});


