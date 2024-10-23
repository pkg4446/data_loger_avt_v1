const fs    = require('fs');

module.exports = {
    
    page:   function(FILE,CSS,JS){ 
        let response = fs.readFileSync(`./html/header.html`, 'utf8');
        response += CSS;
        response += fs.readFileSync(`./html/nav.html`, 'utf8');
        try {
            response += fs.readFileSync(`./html/body/${FILE}.html`, 'utf8');
        } catch (error) {}
        response += fs.readFileSync(`./html/footer.html`, 'utf8');
        response += JS;
        response += fs.readFileSync(`./html/script.html`, 'utf8');
        return response;
    },

    css:   function(CSS){ 
        const response = '<link href="/public/css/'+CSS+'.css" rel="stylesheet" type="text/css" />';
        return response;
    },

    js:   function(JS){ 
        const response = '<script src="/public/js/'+JS+'.js"></script>';
        return response;
    },
}