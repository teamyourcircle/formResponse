const fetch = require('node-fetch');

const switcher = (req, res, next) => {
    const token = req.headers['access-token'];
    const {switch_from,switch_to,form_id} = req.body;
    if(switch_to && form_id){
        fetch_process(switch_to,req.params.integrationId,false,form_id,token)
        .then(res => res.status)
        .then(status => {
            if(status==200){
                fetch_process(switch_from,req.params.integrationId,true,form_id,token)
                .then(res => res.status)
                .then(status=>{
                    if(status==200){
                        next();
                    }else{
                        return res.status(404).json({'msg':'deleted :: false not set'});
                    }
                })
                .catch(err => {
                    return res.status(500).json({'msg':'internal server error'});
                })
            }else{
                return res.status(404).json({'msg':'deleted :: true not set'});
            }
        })
        .catch(err => {
            return res.status(500).json({'msg':'internal server error'});
        })
    }else{
        return res.status(401).json({'msg':'missing data'});
    }
}
module.exports = switcher;

/**
 * fetch api calling
 * @param {*} supportive_email 
 * @param {*} integrationId 
 * @param {*} delete_flag 
 * @param {*} form_id 
 * @param {*} token 
 */
const fetch_process = (supportive_email,integrationId,delete_flag,form_id,token) => {
    const prom = fetch(`http://localhost:5000/auth/api/oauth/edit/account/${integrationId}`, {
            method: 'PUT',
            headers: {
                'access-token': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'supportive_email': supportive_email
            },
            body:JSON.stringify({   
            "property": form_id,
            "delete_flag": delete_flag
            })
    })
    return prom;
}
