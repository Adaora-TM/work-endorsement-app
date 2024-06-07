import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnDpHltTn4qToMl5e0uL-Oh2vhzijRtOM",
  authDomain: "real-time-database-68d43.firebaseapp.com",
  databaseURL: "https://real-time-database-68d43-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "real-time-database-68d43",
  storageBucket: "real-time-database-68d43.appspot.com",
  messagingSenderId: "1005214476456",
  appId: "1:1005214476456:web:10cec08a81cfc5cb3bba9d"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const endorsementsRef = ref(database, "endorsements"); // Reference to endorsements

const nameInputEl = document.getElementById("name-input");
const toInputEl = document.getElementById("to-input"); // New element for "To" field
const messageInputEl = document.getElementById("message-input");
const endorsementFormEl = document.getElementById("endorsement-form");
const endorsementsListEl = document.getElementById("endorsements-list");

endorsementFormEl.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  const name = nameInputEl.value;
  const to = toInputEl.value; // Get value from "To" field
  const message = messageInputEl.value;

  if (!name || !message || !to) {
    alert("Please fill in all fields (Name, To, and Message)!");
    return; // Exit function if any field is empty
  }

  const endorsementData = {
    name: name,
    to: to,
    message: message,
    likes: 0,
  };

  push(endorsementsRef, endorsementData); // Push endorsement to database

  clearInputFields(); // Clear input fields after submission
});



onValue(endorsementsRef, (snapshot) => {
  if (snapshot.exists()) {
    const endorsements = snapshot.val()
    clearEndorsementsList(); // Clear list before repopulating

    Object.entries(endorsements).forEach(([endorsementId, endorsement]) => {
      const endorsementEl = createEndorsementElement(endorsement)
      endorsementsListEl.prepend(endorsementEl)

      const likeButton = endorsementEl.querySelector(".like-button")
      const likeCount = endorsementEl.querySelector(".like-count")

      likeButton.addEventListener("click", async () => {
        try {
          // Get the current like count from the database
          const currentLikesSnapshot = await get(ref(database, `endorsements/${endorsementId}/likes`));
          let currentLikes = currentLikesSnapshot.val() || 0

          // Check if the user has already liked the endorsement
          // Implement your own logic to prevent multiple likes from the same user

          // Increment or decrement the like count based on the user's action
          const newLikes = currentLikes + 1

          // Update the like count in the database
          await set(ref(database, `endorsements/${endorsementId}/likes`), newLikes)

          // Update the like count displayed in the UI
          likeCount.textContent = newLikes
        } catch (error) {
          console.error("Error updating like count:", error)
        }
      })
    })
  } else {
    console.log("No endorsements yet");
  }
});



function clearEndorsementsList() {
  endorsementsListEl.innerHTML = ""; // Clear existing endorsements
}

function clearInputFields() {
  nameInputEl.value = "";
  toInputEl.value = ""; // Clear "To" field as well
  messageInputEl.value = "";
}

function createEndorsementElement(endorsement) {
  const endorsementEl = document.createElement("div");
  endorsementEl.classList.add("endorsement");

  const toEl = document.createElement("h4");
  toEl.textContent = `To: ${endorsement.to}`;
  endorsementEl.appendChild(toEl);

  const messageEl = document.createElement("p");
  messageEl.textContent = endorsement.message;
  endorsementEl.appendChild(messageEl);

  const fromEl = document.createElement("h5");
  fromEl.textContent = `From: ${endorsement.name}`;
  endorsementEl.appendChild(fromEl);

  const likeContainer = document.createElement("div");
  likeContainer.classList.add("like-container");

  const likeButton = document.createElement("button");
  likeButton.textContent = "❤️"; // Heart emoji or any other icon
  likeButton.classList.add("like-button");
  endorsementEl.appendChild(likeButton);

  const likeCount = document.createElement("span");
  likeCount.textContent = "0";
  likeCount.classList.add("like-count");
  endorsementEl.appendChild(likeCount);

  likeButton.addEventListener("click", () => {
    endorsement.likes++; // Increment like count
    likeCount.textContent = endorsement.likes; // Update displayed like count
  });


  return endorsementEl;
}