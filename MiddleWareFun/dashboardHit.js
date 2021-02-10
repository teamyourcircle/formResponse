// this middleware will hit the Dashboard to get user info.
const fetch = require('node-fetch');

const dashResponse = (req, res, next) => {
    const token = req.headers['access-token'];
    //console.log("Middleware running.....");
    if(token === undefined)
        return res.status(401).json({"msg":"Unauthorized"});
    const url = "http://localhost:5002/form/api/myforms";
    const options = {
        method: 'GET',
        headers: {
            'access-token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    fetch(url, options)
    .then(res => res.json())
    .then( data => {
        req.formData = data.form;
        // console.log("Middleware exiting....",data.form);
    })
    .catch(err => res.status(502).json({"msg": "Bad Gateway - " + err.message}));
    next();
}

module.exports = dashResponse;