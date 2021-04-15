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
exports.newformResponse = {
    form_id: '20',
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
exports.formResponse_1 = {
    form_id: '420',
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
exports.newconsumerSchema = {
    formId: '20',
    queueName: 'hello'
}
exports.myForms = {
    "form": [
      {
        "form_title": "test Form",
        "form_id": 118,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      },
      {
        "form_title": "test Form",
        "form_id": 20,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      },
      {
        "form_title": "test Form",
        "form_id": 420,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      }
    ]
}

exports.myFormsListFormService = {
    "forms": [
      {
        "form_title": "sheet Form",
        "form_id": 127,
        "init": "12/03/2021 | 17:44 PM",
        "end": "14/04/2021 | 08:19 AM"
      }
    ]
}

exports.newconsumerResponse = {
    queueName: [
        "hello"
    ],
    "formId": 20
}
exports.consumerResponse_1 = {
    queueName: [
    ],
    "formId": 420
}
exports.consumerResponse = {
    queueName: [
        "hello"
    ],
    "formId": 118
}

exports.formTemplatedeleteRes = {'status':'done','id':20}

exports.formTemplate = {"template": {"form": {"form_title": "sheet Form", "form_description": "Description Section"}, "section": {"section_title": ["Section Title"], "section_description": [""], "section_fields": [2]}, "field": {"field_description": ["", ""], "field_label": ["name", "gender"], "field_type_list": [{"field_type": "text", "index": 0, "options": [], "required": false, "plugins": []}, {"field_type": "choice", "index": 1, "options": ["male", "female"], "required": false, "plugins": []}]}, "form_info": {"form_title": "sheet Form", "form_id": 420, "init": "12/03/2021 | 17:44 PM", "end": "14/04/2021 | 08:19 AM"}}};