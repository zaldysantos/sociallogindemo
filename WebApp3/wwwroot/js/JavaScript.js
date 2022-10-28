/* reCaptcha */
function reCaptcha(dotNetObjRef, divReCaptcha, sitekey) {
    return grecaptcha.render(
        document.getElementById(divReCaptcha), {
            'sitekey': sitekey,
            'callback': (response) => {
                dotNetObjRef.invokeMethodAsync('OnSuccessCallback', response);
            },
            'expired-callback': () => {
                dotNetObjRef.invokeMethodAsync('OnExpiredCallback', response);
            }
        }
    );
};

/* Google Sign-In */
window.onload = function () {
    initGoogleButton();
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

function initGoogleButton() {
    google.accounts.id.initialize({
        client_id: "1073585216015-sps2njhqm56mptpij709s39fr0kqci5u.apps.googleusercontent.com", // https://console.cloud.google.com/apis/credentials
        callback: googleSignInResponse,
    });
}

function popGoogleOneTap() {
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()
            || notification.isSkippedMoment()
            /*|| notification.isDismissedMoment()*/) {
            window.open("https://accounts.google.com/", "_blank");
        }
    });
}

function googleSignInResponse(response) {
    var token = response.credential;
    var jwt = parseJwt(token);
    var url = window.location;
    var baseUrl = url.protocol + "//" + url.host;
    location.href = baseUrl + "/signIn?app=Google"
        + "&id=" + encodeURIComponent(jwt.sub)
        + "&name=" + encodeURIComponent(jwt.name)
        + "&email=" + encodeURIComponent(jwt.email)
        + "&picture=" + encodeURIComponent(jwt.picture);
}

function googleSignOut() {
    google.accounts.id.disableAutoSelect();
}

/* Facebook Login */
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function () {
    FB.init({
        appId: '427522569481472', // https://developers.facebook.com/apps/
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v15.0'
    });
};

function facebookCheckLoginState() {
    FB.getLoginStatus(function (response) {
        facebookLoginStatusChange(response);
    });
}

function facebookLoginStatusChange(response) {
    if (response.status === 'connected') {
        facebookLoginResponse();
    }
}

function facebookLoginRequest() {
    FB.login(function (response) {
        if (response.authResponse) {
            facebookLoginResponse();
        }
    }, {
        scope: 'public_profile,email'
    });
}

function facebookLoginResponse() {
    FB.api('/me', function (response) {
        var url = window.location;
        var baseUrl = url.protocol + "//" + url.host;
        location.href = baseUrl + "/signIn?app=Facebook"
            + "&id=" + encodeURIComponent(response.id)
            + "&name=" + encodeURIComponent(response.name)
            + "&email=" + encodeURIComponent(response.email)
            + "&picture=" + encodeURIComponent("https://graph.facebook.com/" + response.id + "/picture?type=large&access_token=427522569481472|OmsT9jKIwNuk463Qo3BquOOdXrk");
    });
}

function facebookLogout() {
    FB.logout(function (response) {
        console.log(response);
    });
}
