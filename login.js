
document.addEventListener("DOMContentLoaded", function () {
  var LoginFormLoader = false;
  const SignUpPage = document.getElementById("GoTosignUpPage");
  SignUpPage.addEventListener("click", SignUpPageLoad);
  chrome.storage.local.get(["loggedIn", "email" , "userProfiledata"], (data) => {
    if (data.loggedIn && data.email && (!data.userProfiledata) ) {
      window.location.href = "/UserProfileData.html";
    }
    else if (data.loggedIn && data.email && data.userProfiledata){
      window.location.href = "/homepage.html";
    }
    else {
      LoginFormLoader = true;
    }
  });
    if (LoginFormLoader) {
      
      let invalidCredentialCheck = false;
      const CredentialInvalidMessage=document.getElementById("CredentialsValidationMessage");
      CredentialInvalidMessage.style.display = "none";
      CredentialInvalidMessage.style.color = "";
      
      const loginForm = document.getElementById("login-form");
      loginForm.addEventListener("submit", handleLogin);
      async function handleLogin(event) {
      event.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      console.log(email);
      console.log(password);
      
          try {
            const response = await fetch('http://localhost:3003/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });
      
            console.log('Response status:', response.status);
      
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
      
            const data = await response.json();
            console.log('Response from server:', data); 
            console.log('Message from server:', data.message); 
      
            if (data.message === 'Login successful') {
              console.log('Login was successful!'); 
              chrome.storage.local.set({ loggedIn: true,  email:email  }, () => {
                window.location.href = "/UserProfileData.html";
              });
            }
            else if (data.message === 'Invalid credentials') {
              console.log('Invalid credentialss'); 
              invalidCredentialCheck = true;
              if ( invalidCredentialCheck)
              {
                CredentialInvalidMessage.style.display = "block";
                CredentialInvalidMessage.style.color="red";
                invalidCredentialCheck=false; 
              }
            }
            else {
              console.log('Invalid credentials. Please try again.'); 
              window.alert("Invalid credentials !!. Please try again.")
            }
          } catch (error) {
            console.error('Error sending login data:', error);
          }
        }
        const googlelogin = document.getElementById("google-login");
        googlelogin.addEventListener("click" , loginWithGoogle);
        async function loginWithGoogle() {
          chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            try {
              console.log("OAuth Token:", token);
      
              const Googleresponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
        
              if (!Googleresponse.ok) {
                throw new Error('Error fetching Google profile data');
              }
        
              const userData = await Googleresponse.json();
              console.log('Google Profile Data:', userData);
        
              const response = await fetch('http://localhost:3003/google-login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: userData.name, email: userData.email}),
              });
        
              console.log('Response status:', response.status);
        
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
        
              const data = await response.json();
              console.log('Response from server:', data); 
              console.log('Message from server:', data.message); 
      
              if (data.message === 'Login successful') {
                console.log('Login was successful!'); 
                
                chrome.storage.local.set({ loggedIn: true,email: userData.email }, () => {
                  window.location.href = "/UserProfileData.html";
                });
              } else {
                console.log('Login with Google failed.'); 
                window.alert("Login with Google failed.");
              }
            } catch (error) {
              console.error('Error during Google login:', error);
            }
          });
        }
        document.addEventListener("click", function (event) {
          const target = event.target;
          if (target.tagName === "INPUT") {
            invalidCredentialCheck = false;
            CredentialInvalidMessage.style.display = "none";
            CredentialInvalidMessage.style.color = "";
          }
        });
      function SignUpPageLoad() {
        window.location.href = "/signUp.html";
      }
  
    }
   
});






