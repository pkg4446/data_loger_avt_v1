if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device')==null){
    window.location.href = '/web';
}else{
    console.log("device_detail: "+localStorage.getItem('device'));
}