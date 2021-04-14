//one section with two fields
exports.formResponse = {
    form_id: '118',
    section_list: [
        [{
            is_choice:true,
            gender: {
                male: 0,
                female: 1
            }
        },{
            is_choice:false,
            name: "nitesh"
        }]
    ]
}

//user info by token
exports.userInfo = {
    email: 'kumarnitesh@mail.com',
    isverified: true, 
    id: '384738474747'
}

// add consumer
exports.consumerSchema = {
    formId: '118',
    queueName: 'hello'
}

exports.myForms = {
    "form": [
      {
        "form_title": "sheet Form",
        "form_id": 118,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      }
    ]
}

exports.consumerResponse = {
    queueName: [
        "hello"
    ],
    "formId": 118
}

exports.formTemplatedeleteRes = {'status':'done','id':118}