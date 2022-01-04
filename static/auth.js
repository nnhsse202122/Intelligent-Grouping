let auth2
let currentUser
gapi.load('auth2', () => {
  auth2 = gapi.auth2.init({
    client_id: '245771948528-c31us1t1k3l0tpmlcm2kq8jd33jmd6rj.apps.googleusercontent.com'
  })

  auth2.then(() => {
    if (!auth2.isSignedIn.get()) {
      showFade(loginContainer)
      endLoad()
    }
  })

  gapi.signin2.render('login-btn', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark'
  })

  auth2.attachClickHandler('login-btn', {})

  auth2.isSignedIn.listen(signinChanged)
  auth2.currentUser.listen(userChanged)
})

function signinChanged(val) {
  if (!val) {
    signOut()
  }
}

async function signOut() {
  loadAround(async () => {
    await auth2.signOut()
    hideFade(app)
    showFade(loginContainer)
    setState(0)
    setTimeout(() => {
      resetApp()
    }, 300)
  })
}

async function userChanged(user) {
  if (auth2.isSignedIn.get() && state.mode == 0) {
    await loadAround(async () => {
      const verification = await verify(user)
      if (verification.status) {
        currentUser = verification.user
        if (verification.user.given_name || verification.user.family_name) {
          username.innerText = (verification.user.given_name[0] || "") + (verification.user.family_name[0] || "")
        } else {
          username.innerText = "👤"
        }
        for (const classObj of verification.classes) {
          addClass(classObj)
        }
        hideFade(loginContainer)
        showFade(app)
        setState(1)
      }
    })
  }
}

async function verify(user) {
  const res = await fetch("/login", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token: user.getAuthResponse().id_token
    }
  }).then(res => res.json())
  return res
}

signOutBtn.addEventListener("click", signOut)