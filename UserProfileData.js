document.addEventListener("DOMContentLoaded", function () {

  const signOutButton = document.getElementById("sign-out");
  signOutButton.addEventListener("click", handleSignOut);
 let email;

 chrome.storage.local.get(["loggedIn", "email"], (data) => {
  if (data.loggedIn && data.email) {
    // If the user is logged in, redirect to the default page (e.g., geturl.html)
    email=data.email;
  }
});

  const submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", function () {
    const profileUrl = document.getElementById("profile-url").value;
    if (profileUrl.trim() === "") {
      alert("Please enter a valid Upwork profile URL.");
      return;
    }
    // Fetch the profile URL in the background without showing the tab to the user
    fetch(profileUrl)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const profileData = doc.querySelector(".text-pre-line.break").innerText;
        const profileDiv = document.getElementById("profile-data");
        profileDiv.innerText = profileData;
        console.log("data scraped");
        console.log(profileData);

        // Send user signup data to the backend server
        fetch("http://localhost:3003/profile-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, profiledata: profileData }),
        })
          .then((response) => {
            console.log("Response status:", response.status);
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Response from server:", data);
            console.log("Message from server:", data.message);
            if (data.message === "Data stored Successfully") {
              console.log("Data stored Successfully!");
              // Handle successful response if needed
              chrome.storage.local.set({ loggedIn: true,email: email , userProfiledata:true }, () => {
                window.location.href="/homepage.html";
              });
             
            } else {
              console.log("Data was not stored Successfully!");
              // Handle unsuccessful response if needed
            }
          })
          .catch((error) => {
            console.error("Error sending profile data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
});

function handleSignOut() {
  chrome.storage.local.remove(["loggedIn", "email", "password"], () => {
    window.location.href = "/login.html";
  });
}
