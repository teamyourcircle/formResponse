const fetch = require('node-fetch');

const switcher = (req, res, next) => {
    const token = req.headers['access-token'];
    const formId = req.body.form_id;
    if(token === undefined)
        return res.status(401).json({"msg":"Unauthorized"});
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
        data["integartionList"].forEach(ele => {
            if(ele.email == req.body.switch_to)
                req.switch_to = ele;
            if(ele.email == req.body.switch_from)
                req.switch_from = ele;
        });
        const integ_id = "google-sheets";
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
            return res.status(200).json({'msg': 'switched..!!', 'data': data});
        })
        .catch( err => res.status(400).json({'msg' : `error : : ${err.message}`}))
    })
    .catch(err => res.status(400).json({'msg' : `error : : ${err.message}`}));
}
module.exports = switcher;