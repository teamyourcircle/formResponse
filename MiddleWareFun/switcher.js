const fetch = require('node-fetch');

const switcher_to = (req, res, next) => {
    const token = req.headers['access-token'];
    const formId = req.body.form_id;
    const url = "http://localhost:5000/auth/api/user/oauthApps";
    const options = {
        method: 'GET',
        headers: {
            'access-token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    fetch(url, options)
    .then(resp => resp.json())
    .then( data => {
        if(data["integartionList"] == undefined)
            return res.status(404).json({'msg': 'Data not found'});
        data["integartionList"].forEach(ele => {
            // if(ele == undefined)
            //     return res.status(404).json({'msg': 'supportive email is not found'});
            if(ele.email == req.body.switch_to)
                req.switch_to = ele;
            if(ele.email == req.body.switch_from)
                req.switch_from = ele;
        });
        if(req.switch_to != undefined ) {
            const integ_id = req.switch_to.integration_id;
            const sheetId = req.switch_to.additional_info[formId].sheetId;
            const spreadId = req.switch_to["additional_info"][formId].spreadsheet_id;
            const uri = `http://localhost:5000/auth/api/oauth/edit/${integ_id}`;
            const option = {
                method: 'PUT',
                headers: {
                    'access-token': token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'supportive_email': req.body.switch_to,
                },
                body:JSON.stringify({   
                    [formId] : {
                        "spreadsheet_id": spreadId,
                        "sheetId": sheetId,
                        "deleted": false
                    }
                })
            }
            fetch(uri, option)
            .then(resp => resp.json())
            .then( data => {
                if(req.switch_from != undefined) {
                    const uri_from = `http://localhost:5000/auth/api/oauth/edit/remove/${integ_id}`;
                    const option_from = {
                        method: 'PUT',
                        headers: {
                            'access-token': token,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'supportive_email': req.body.switch_from,
                        },
                        body:JSON.stringify({
                            "property" : formId
                        })
                    }
                    fetch(uri_from, option_from)
                    .then( data => {
                        next();
                    })
                    .catch( err => res.status(400).json({'msg' : `error : : ${err}`}))
                }
                else
                    return res.status(404).json({'msg': 'supportive email_from is not found'});
            })
            .catch( err => res.status(400).json({'msg' : `error : : ${err}`}))
        }
        else 
        return res.status(404).json({'msg': 'supportive email_to is not found'});
    })
    .catch(err => res.status(400).json({'msg' : `error : : ${err}`}));
}
module.exports = switcher_to;