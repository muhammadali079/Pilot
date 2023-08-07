// import { includes } from "b4a";

document.addEventListener("DOMContentLoaded", function () {
  let LoadSignUpPage = false;
  const LoginPage = document.getElementById("GotoLoginPage");
  LoginPage.addEventListener("click", LoginPageLoad);
  chrome.storage.local.get(["loggedIn", "email", "userProfiledata"], (data) => {
    if (data.loggedIn && data.emai && (!data.userProfiledata)) {
      // If the user is logged in, redirect to the default page (e.g., geturl.html)
      window.location.href = "/UserProfileData.html";
    }
    else if (data.loggedIn && data.email && data.userProfiledata)
    {
      window.location.href = "/homepage.html";
    }
    else
    {
      LoadSignUpPage= true;
    }

  });

    if (LoadSignUpPage)
    {
      const emailValidationMessage = document.getElementById("emailValidationMessage");
      const passwordValidationMessage = document.getElementById("passwordValidationMessage");
      const signupForm = document.getElementById("signup-form");
      signupForm.addEventListener("submit", handleSignup);
      function handleSignup(event) {
        event.preventDefault();
  
        const username = document.getElementById("username").value;
        const emailInput = document.getElementById("Email");
        const email = emailInput.value;
        const passwordInput= document.getElementById("password");
        const password=passwordInput.value;
        console.log(username);
        console.log(email);
        console.log(password);
        let validPass = false ;
        let validEmail = false;
  
       if (!email.includes("@gmail.com"))
       {
        emailValidationMessage.style.display = "block";
        emailInput.style.borderColor = "red";
       }
       else 
       {
        validEmail = true ;
        emailValidationMessage.style.display = "none";
        emailInput.style.borderColor = "";
        
       }
        if (password.length<8)
       {
       
        passwordValidationMessage.style.display = "block";
        passwordInput.style.borderColor = "red";
       }
       else 
       {
        validPass=true;
        passwordValidationMessage.style.display = "none";
        passwordInput.style.borderColor = "";
       }
  
       if (validPass && validEmail)
       {
        // Send user signup data to the backend server
        fetch('http://localhost:3003/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        })
        .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Response from server:', data); // Add this line to check the response data
          console.log('Message from server:', data.message); // Add this line to check the message
          // You can handle the response from the server here
          if (data.message === 'Signup successful') {
            console.log('Signup was successful!'); // Add this line to check if this block is reached
           // Storing user data in chrome.storage.local
              chrome.storage.local.set({ loggedIn: true, email: email  }, () => {
                window.location.href = "/UserProfileData.html";
              });
          } else {
            console.log('Signup was not successful!'); // Add this line to check if this block is reached
          }
        })
        .catch(error => {
          console.error('Error sending signup data:', error);
        });
  
      }
     }
    }


function LoginPageLoad()
{
  window.location.href = "/login.html";
}

});

