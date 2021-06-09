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
exports.formArray = [
    {
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
    },
    {
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
    },
    {
        form_id: '111',
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
]
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
      },
      {
        "form_title": "test Form",
        "form_id": 111,
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

exports.integrationList = {
    "integartionList": [
      {
        "_id": "",
        "social_id": "",
        "oauth_provider": "google",
        "access_token": "",
        "user": "",
        "email": "hardik@mail.com",
        "integration_id": "google-sheets",
        "refresh_token": "",
        "__v": 0,
        "additional_info": {
          "111": {
            "spreadsheet_id": "",
            "sheetId": 007
          }
        }
      }
    ]
  };

exports.googleSheetResponse = {
    url: "",
    sheet_info: {
        spreadsheet_id:"",
        sheeId:"",
    },
    supportive_email: "hardik@gmail.com",
    status: 200,
};

exports.formResponseArray = [
    {
    "_id": "606af26e0b77321ae8eac21a",
    "sections": [
        [
        {
            "is_choice": false,
            "name": "Hardik"
        },
        {
            "is_choice": false,
            "mob": "646546"
        },
        {
            "is_choice": true,
            "occupasion": {
            "student": true,
            "business": 0
            }
        },
        {
            "is_choice": true,
            "gender": {
            "male": 1,
            "female": 0
            }
        }
        ]
    ],
    "formId": 111,
    "responseBy": "hardikshah.hs2015@gmail.com",
    "__v": 0
    },
    {
    "_id": "606af29b0b77321ae8eac21b",
    "sections": [
        [
        {
            "is_choice": false,
            "name": "Nitesh "
        },
        {
            "is_choice": false,
            "mob": "4651531"
        },
        {
            "is_choice": true,
            "occupasion": {
            "student": true,
            "business": true
            }
        },
        {
            "is_choice": true,
            "gender": {
            "male": 1,
            "female": 0
            }
        }
        ]
    ],
    "formId": 111,
    "responseBy": "hardikshah.hs2015@gmail.com",
    "__v": 0
    }
]

exports.sheetFunctionalityResource = {
    client_id: "391383527608-vq5pjfpslfeq4i10624rvt088eqhsa4p.apps.googleusercontent.com",
    client_secret: "HtTwp2jwnOrLK5qaY-0nNPUA",
    redirect_uri: "http://localhost:3000",
    refresh_token: "1//0g4WtalsTml6mCgYIARAAGBASNwF-L9IrF7VLjZLRBdshBtPVY8J0zhUy2EKbJHrAqAm_QNf0gw-gb7fLVJHDX-TDSBGtDNZbF8k",
    spreadsheet_id: "1XsMLItLjKOvzNuszUMCd0sncasUYmC6GQcQukZ5YmJQ",
    sheetId: 639480134,
    my_formData:[
      {
        "_id": "605b7f349f376b4228108cd7",
        sections: [
          [
            {
                is_choice: false,
                name: "now"
            },
            {
                is_choice: true,
                gender: {
                    male: 1,
                    female: 0
              }
            }
          ]
        ],
        formId: 118,
        responseBy: "niteshditest@gmail.com",
        "__v": 0
      },
      {
        "_id": "605b8216a81fbf4624e2d4e6",
        sections: [
          [
            {
                is_choice: false,
                name: "sss"
            },
            {
                is_choice: true,
                gender: {
                    male: 1,
                    female: 0
              }
            }
          ]
        ],
        formId: 118,
        responseBy: "niteshditest@gmail.com",
        "__v": 0
      }
    ]
}
  