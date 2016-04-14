require.config({
    shim : {
        'bootstrap' : { 'deps' :['jquery'] }
    },
    paths: {
        'jquery':'components/jquery/dist/jquery.min',
        'bootstrap':'components/bootstrap/dist/js/bootstrap.min'
    },
    priority:['jquery']
});