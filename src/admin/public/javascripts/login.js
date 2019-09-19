$(document).ready(() => {
    $('#login').submit((e) => {
        e.preventDefault();
        $.post('/login', {username: $('#username').val(), password: $('#password').val()})
        .done((val) => {
            if(val) {
                localStorage.setItem('login', val);
                window.location.replace('/manageUrl')
            } else {
                alert('wrong username or password');
            }
        })
    })
})