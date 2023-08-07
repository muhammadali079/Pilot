document.addEventListener("DOMContentLoaded", function () {

    const signOutButton = document.getElementById("sign-out");
    signOutButton.addEventListener("click", handleSignOut);
    const submitButton = document.getElementById("submit-button");
    var email;

    chrome.storage.local.get(["loggedIn", "email"], (data) => {
     if (data.loggedIn && data.email) {
       email=data.email;
     }
    });

  submitButton.addEventListener("click", function () {
    const jobUrl = document.getElementById("JobURl").value;
    if (jobUrl.trim() === "") {
      alert("Please enter a valid Upwork job URL.");
      return;
    }
    fetch(jobUrl)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const jobDescriptionData = doc.querySelector(".up-card").innerText;
        console.log("job data scraped");
        console.log(jobDescriptionData);
        fetch("http://localhost:3003/job-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, jobData: jobDescriptionData }),
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
            if (data.message === "Job Data stored Successfully") {
              console.log("Job Data stored Successfully!");
            } else {
              console.log("Job Data was not stored Successfully!");
            }
          })
          .catch((error) => {
            console.error("Error sending JOb data:", error);
          });
      })
        .catch((error) => {
            console.error("Error fetching data:", error);
          });
      });


});
function handleSignOut() {
    chrome.storage.local.remove(["loggedIn", "email", "password", "userProfiledata"], () => {
      window.location.href = "/login.html";
    });
  }
  